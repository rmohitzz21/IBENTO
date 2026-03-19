import crypto from 'crypto'
// import razorpay from '../config/razorpay.js'  // disabled until real keys are added
import Booking from '../models/Booking.js'

// POST /api/payments/create-order
export const createOrder = async (req, res) => {
  const { amount, currency = 'INR', bookingId } = req.body

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' })
  }

  // TODO: uncomment when real Razorpay keys are added to .env
  // const order = await razorpay.orders.create({
  //   amount: Math.round(amount * 100),
  //   currency,
  //   receipt: `order_${Date.now()}`,
  //   notes: { bookingId: bookingId || '' },
  // })
  // return res.json({ success: true, order: { id: order.id, amount: order.amount, currency: order.currency }, key: process.env.RAZORPAY_KEY_ID })

  return res.status(503).json({
    success: false,
    message: 'Payments are not configured yet. Add Razorpay keys to server/.env to enable.',
  })
}

// POST /api/payments/verify
export const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body

  // TODO: uncomment when real Razorpay keys are added
  // const expectedSig = crypto
  //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  //   .update(`${razorpayOrderId}|${razorpayPaymentId}`)
  //   .digest('hex')
  // if (expectedSig !== razorpaySignature) {
  //   return res.status(400).json({ success: false, message: 'Payment verification failed: signature mismatch' })
  // }
  // if (bookingId) {
  //   await Booking.findByIdAndUpdate(bookingId, { razorpayPaymentId, paymentStatus: 'advance-paid' })
  // }
  // return res.json({ success: true, message: 'Payment verified', paymentId: razorpayPaymentId })

  return res.status(503).json({
    success: false,
    message: 'Payments are not configured yet.',
  })
}

// POST /api/payments/webhook
export const handleWebhook = async (req, res) => {
  // TODO: uncomment when real Razorpay webhook secret is added
  // const signature = req.headers['x-razorpay-signature']
  // const expectedSig = crypto
  //   .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
  //   .update(JSON.stringify(req.body))
  //   .digest('hex')
  // if (signature !== expectedSig) {
  //   return res.status(400).json({ success: false, message: 'Invalid webhook signature' })
  // }
  // const { event, payload } = req.body
  // if (event === 'payment.captured') {
  //   const payment = payload.payment.entity
  //   await Booking.findOneAndUpdate({ razorpayOrderId: payment.order_id }, { razorpayPaymentId: payment.id, paymentStatus: 'advance-paid' })
  // }
  res.json({ status: 'ok' })
}

// GET /api/payments/history
export const getPaymentHistory = async (req, res) => {
  const { page = 1, limit = 10 } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  const [bookings, total] = await Promise.all([
    Booking.find({ userId: req.user._id, paymentStatus: { $ne: 'pending' } })
      .select('bookingNumber totalAmount advanceAmount paymentStatus status createdAt serviceId')
      .populate('serviceId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments({ userId: req.user._id, paymentStatus: { $ne: 'pending' } }),
  ])

  res.json({
    success: true,
    payments: bookings,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  })
}
