import crypto from 'crypto'
import razorpay from '../config/razorpay.js'
import Booking from '../models/Booking.js'
import Vendor from '../models/Vendor.js'
import Notification from '../models/Notification.js'
import { sendBookingConfirmation } from '../services/email.service.js'

// POST /api/payments/create-order
export const createOrder = async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({
      success: false,
      message: 'Payments are not configured. Please contact support.',
    })
  }

  const { amount, currency = 'INR', bookingId } = req.body

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid payment amount' })
  }

  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'Booking ID is required' })
  }

  // Verify booking belongs to user and is in a payable state
  const booking = await Booking.findOne({ _id: bookingId, userId: req.user._id })
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' })
  }
  if (['cancelled', 'rejected', 'completed'].includes(booking.status)) {
    return res.status(400).json({ success: false, message: 'This booking cannot be paid for' })
  }

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100), // Razorpay expects paise
    currency,
    receipt: `rcpt_${bookingId}_${Date.now()}`,
    notes: { bookingId, userId: req.user._id.toString() },
  })

  // Save order ID on booking so webhook / verify can find it
  await Booking.findByIdAndUpdate(bookingId, { razorpayOrderId: order.id })

  return res.json({
    success: true,
    order: { id: order.id, amount: order.amount, currency: order.currency },
    key: process.env.RAZORPAY_KEY_ID,
  })
}

// POST /api/payments/verify
export const verifyPayment = async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ success: false, message: 'Payments are not configured.' })
  }

  // Accept both snake_case (from Razorpay SDK) and camelCase
  const razorpayOrderId = req.body.razorpayOrderId || req.body.razorpay_order_id
  const razorpayPaymentId = req.body.razorpayPaymentId || req.body.razorpay_payment_id
  const razorpaySignature = req.body.razorpaySignature || req.body.razorpay_signature
  const { bookingId } = req.body

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ success: false, message: 'Missing payment verification data' })
  }

  // Verify HMAC signature
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')

  if (expectedSig !== razorpaySignature) {
    return res.status(400).json({
      success: false,
      message: 'Payment verification failed. Please contact support if money was deducted.',
    })
  }

  // Find booking by order ID or bookingId
  const filter = bookingId
    ? { _id: bookingId }
    : { razorpayOrderId }

  const booking = await Booking.findOneAndUpdate(
    filter,
    { razorpayPaymentId, razorpayOrderId, paymentStatus: 'advance-paid' },
    { new: true }
  )
    .populate('userId', 'name email')
    .populate('serviceId', 'title')
    .populate('vendorId')

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found for this payment' })
  }

  // Increment vendor booking count
  await Vendor.findByIdAndUpdate(booking.vendorId._id, { $inc: { totalBookings: 1 } })

  // Send confirmation email (non-fatal)
  try {
    await sendBookingConfirmation(booking.userId.email, booking)
  } catch (emailErr) {
    console.error('Booking confirmation email failed (non-fatal):', emailErr.message)
  }

  // Notify vendor via in-app notification + socket
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

  return res.json({
    success: true,
    message: 'Payment verified. Booking confirmed!',
    booking,
  })
}

// POST /api/payments/webhook  (raw body required — configured in index.js)
export const handleWebhook = async (req, res) => {
  // If webhook secret not configured, silently accept to avoid Razorpay retries
  if (
    !process.env.RAZORPAY_WEBHOOK_SECRET ||
    process.env.RAZORPAY_WEBHOOK_SECRET === 'xxx'
  ) {
    return res.json({ status: 'ok' })
  }

  const signature = req.headers['x-razorpay-signature']
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex')

  if (signature !== expectedSig) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' })
  }

  const { event, payload } = req.body

  if (event === 'payment.captured') {
    const payment = payload.payment.entity
    await Booking.findOneAndUpdate(
      { razorpayOrderId: payment.order_id },
      { razorpayPaymentId: payment.id, paymentStatus: 'advance-paid' }
    )
  }

  if (event === 'payment.failed') {
    const payment = payload.payment.entity
    console.warn(`Payment failed for order: ${payment.order_id}`)
  }

  res.json({ status: 'ok' })
}

// GET /api/payments/history
export const getPaymentHistory = async (req, res) => {
  const { page = 1, limit = 10 } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  const [bookings, total] = await Promise.all([
    Booking.find({ userId: req.user._id, paymentStatus: { $ne: 'pending' } })
      .select('bookingNumber totalAmount advanceAmount paymentStatus status createdAt serviceId razorpayPaymentId')
      .populate('serviceId', 'title')
      .populate('vendorId', 'businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments({ userId: req.user._id, paymentStatus: { $ne: 'pending' } }),
  ])

  res.json({
    success: true,
    payments: bookings,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  })
}
