import crypto from 'crypto'
import Booking from '../models/Booking.js'
import Service from '../models/Service.js'
import Vendor from '../models/Vendor.js'
import razorpay from '../config/razorpay.js'
import { sendBookingConfirmation } from '../services/email.service.js'
import Notification from '../models/Notification.js'

// POST /api/bookings
export const createBooking = async (req, res) => {
  const {
    serviceId, eventDate, eventType, eventAddress, guestCount,
    specialRequests, addOns = [], couponCode,
  } = req.body

  const service = await Service.findById(serviceId).populate('vendorId')
  if (!service || !service.isActive) {
    return res.status(404).json({ success: false, message: 'Service not found or inactive' })
  }

  const vendor = service.vendorId
  if (!vendor || vendor.status !== 'approved') {
    return res.status(400).json({ success: false, message: 'Vendor not available' })
  }

  // Check date availability
  const eDate = new Date(eventDate)
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + (service.minBookingDays || 7))
  if (eDate < minDate) {
    return res.status(400).json({
      success: false,
      message: `Booking must be at least ${service.minBookingDays || 7} days in advance`,
    })
  }

  // Check for existing bookings on that date
  const conflict = await Booking.findOne({
    vendorId: vendor._id,
    eventDate: eDate,
    status: { $in: ['pending', 'confirmed'] },
  })
  if (conflict) {
    return res.status(409).json({ success: false, message: 'Vendor is already booked on this date' })
  }

  // Calculate amounts
  const addOnTotal = addOns.reduce((sum, a) => sum + (a.price || 0), 0)
  const totalAmount = service.price + addOnTotal
  const advanceAmount = Math.round((totalAmount * service.minAdvancePercent) / 100)
  const platformFee = Math.round(totalAmount * 0.05) // 5% platform fee
  const netVendorAmount = totalAmount - platformFee

  // Create Razorpay order
  const order = await razorpay.orders.create({
    amount: advanceAmount * 100, // paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
    notes: { serviceId, userId: req.user._id.toString() },
  })

  const booking = await Booking.create({
    userId: req.user._id,
    vendorId: vendor._id,
    serviceId,
    eventDate: eDate,
    eventType,
    eventAddress,
    guestCount,
    specialRequests,
    addOns,
    totalAmount,
    advanceAmount,
    remainingAmount: totalAmount - advanceAmount,
    platformFee,
    netVendorAmount,
    couponCode,
    razorpayOrderId: order.id,
  })

  res.status(201).json({
    success: true,
    message: 'Booking created. Complete payment to confirm.',
    booking,
    order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    },
  })
}

// POST /api/bookings/payment/verify
export const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')

  if (expectedSig !== razorpaySignature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' })
  }

  const booking = await Booking.findOneAndUpdate(
    { razorpayOrderId },
    {
      razorpayPaymentId,
      paymentStatus: 'advance-paid',
      status: 'pending', // vendor still needs to confirm
    },
    { new: true }
  ).populate('userId', 'name email')
    .populate('serviceId', 'title')
    .populate('vendorId')

  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

  // Update vendor booking count
  await Vendor.findByIdAndUpdate(booking.vendorId._id, { $inc: { totalBookings: 1 } })

  // Send confirmation email
  try {
    await sendBookingConfirmation(booking.userId.email, booking)
  } catch {}

  // Notify vendor
  await Notification.create({
    userId: booking.vendorId.userId,
    type: 'new_booking',
    title: 'New Booking Request',
    message: `You have a new booking for ${new Date(booking.eventDate).toLocaleDateString('en-IN')}`,
    data: { bookingId: booking._id },
  })

  if (req.io) {
    req.io.to(`user-${booking.vendorId.userId}`).emit('booking:new', { booking })
  }

  res.json({ success: true, message: 'Payment verified and booking confirmed', booking })
}

// GET /api/bookings/my
export const getMyBookings = async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query
  const filter = { userId: req.user._id }
  if (status) filter.status = status

  const skip = (Number(page) - 1) * Number(limit)

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('vendorId', 'businessName rating city')
      .populate('serviceId', 'title price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments(filter),
  ])

  res.json({
    success: true,
    bookings,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  })
}

// GET /api/bookings/:id
export const getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('userId', 'name email phone avatar')
    .populate('vendorId', 'businessName rating city phone bankAccount')
    .populate('serviceId', 'title price priceType images')
    .populate('reviewId')

  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

  // Ensure user can only see their own booking (or vendor/admin)
  const vendor = await Vendor.findOne({ userId: req.user._id })
  const isOwner = booking.userId._id.toString() === req.user._id.toString()
  const isVendor = vendor && booking.vendorId._id.toString() === vendor._id.toString()
  const isAdmin = req.user.role === 'admin'

  if (!isOwner && !isVendor && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Forbidden' })
  }

  res.json({ success: true, booking })
}

// PUT /api/bookings/:id/accept (vendor)
export const acceptBooking = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(403).json({ success: false, message: 'Vendor account required' })

  const booking = await Booking.findOne({ _id: req.params.id, vendorId: vendor._id })
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

  if (booking.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending bookings can be accepted' })
  }

  booking.status = 'confirmed'
  if (req.body.vendorNote) booking.vendorNote = req.body.vendorNote
  await booking.save()

  await Notification.create({
    userId: booking.userId,
    type: 'booking_confirmed',
    title: 'Booking Confirmed!',
    message: `Your booking ${booking.bookingNumber} has been confirmed by the vendor.`,
    data: { bookingId: booking._id, vendorId: vendor._id },
  })

  if (req.io) {
    req.io.to(`user-${booking.userId}`).emit('booking:update', { bookingId: booking._id, status: 'confirmed' })
  }

  res.json({ success: true, message: 'Booking accepted', booking })
}

// PUT /api/bookings/:id/reject (vendor)
export const rejectBooking = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(403).json({ success: false, message: 'Vendor account required' })

  const booking = await Booking.findOne({ _id: req.params.id, vendorId: vendor._id })
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

  if (booking.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending bookings can be rejected' })
  }

  booking.status = 'rejected'
  booking.cancelReason = req.body.reason || 'Vendor unavailable'
  await booking.save()

  await Notification.create({
    userId: booking.userId,
    type: 'booking_rejected',
    title: 'Booking Rejected',
    message: `Your booking ${booking.bookingNumber} was rejected. ${booking.cancelReason}`,
    data: { bookingId: booking._id },
  })

  if (req.io) {
    req.io.to(`user-${booking.userId}`).emit('booking:update', { bookingId: booking._id, status: 'rejected' })
  }

  res.json({ success: true, message: 'Booking rejected', booking })
}

// PUT /api/bookings/:id/complete
export const completeBooking = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(403).json({ success: false, message: 'Vendor account required' })

  const booking = await Booking.findOne({ _id: req.params.id, vendorId: vendor._id })
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

  if (booking.status !== 'confirmed') {
    return res.status(400).json({ success: false, message: 'Only confirmed bookings can be marked complete' })
  }

  booking.status = 'completed'
  await booking.save()

  await Vendor.findByIdAndUpdate(vendor._id, {
    $inc: { totalEarnings: booking.netVendorAmount || 0 },
  })

  await Notification.create({
    userId: booking.userId,
    type: 'booking_completed',
    title: 'Booking Completed',
    message: `Your event is done! Leave a review for ${vendor.businessName}.`,
    data: { bookingId: booking._id, vendorId: vendor._id },
  })

  res.json({ success: true, message: 'Booking marked as completed', booking })
}

// PUT /api/bookings/:id/cancel
export const cancelBooking = async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    userId: req.user._id,
  })

  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

  if (['completed', 'cancelled', 'rejected'].includes(booking.status)) {
    return res.status(400).json({ success: false, message: 'Cannot cancel this booking' })
  }

  booking.status = 'cancelled'
  booking.cancelReason = req.body.reason || 'Cancelled by user'
  await booking.save()

  const vendor = await Vendor.findById(booking.vendorId)
  if (vendor) {
    await Notification.create({
      userId: vendor.userId,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Booking ${booking.bookingNumber} was cancelled by the customer.`,
      data: { bookingId: booking._id },
    })
    if (req.io) {
      req.io.to(`user-${vendor.userId}`).emit('booking:update', { bookingId: booking._id, status: 'cancelled' })
    }
  }

  res.json({ success: true, message: 'Booking cancelled', booking })
}

// GET /api/bookings/:id/invoice
export const getBookingInvoice = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('userId', 'name email phone')
    .populate('vendorId', 'businessName city pan gst')
    .populate('serviceId', 'title price priceType')

  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

  const isOwner = booking.userId._id.toString() === req.user._id.toString()
  const vendor = await Vendor.findOne({ userId: req.user._id })
  const isVendor = vendor && booking.vendorId._id.toString() === vendor._id.toString()

  if (!isOwner && !isVendor && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' })
  }

  res.json({ success: true, invoice: booking })
}
