import User from '../models/User.js'
import Vendor from '../models/Vendor.js'
import Booking from '../models/Booking.js'
import Review from '../models/Review.js'
import Withdrawal from '../models/Withdrawal.js'
import Category from '../models/Category.js'
import Notification from '../models/Notification.js'
import { sendVendorApproval, sendVendorRejection, sendWithdrawalUpdate } from '../services/email.service.js'

// GET /api/admin/dashboard
export const getDashboard = async (req, res) => {
  const [
    totalUsers,
    totalVendors,
    totalBookings,
    pendingVendors,
    pendingWithdrawals,
    recentBookings,
    revenueData,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Vendor.countDocuments({ status: 'approved' }),
    Booking.countDocuments(),
    Vendor.countDocuments({ status: 'pending' }),
    Withdrawal.countDocuments({ status: 'pending' }),
    Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name')
      .populate('vendorId', 'businessName')
      .populate('serviceId', 'title'),
    Booking.aggregate([
      {
        $match: {
          paymentStatus: { $in: ['advance-paid', 'fully-paid'] },
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$platformFee' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ])

  res.json({
    success: true,
    stats: { totalUsers, totalVendors, totalBookings, pendingVendors, pendingWithdrawals },
    recentBookings,
    revenueData,
  })
}

// GET /api/admin/vendors
export const getAllVendors = async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query
  const filter = {}
  if (status) filter.status = status
  if (search) filter.businessName = new RegExp(search, 'i')

  const skip = (Number(page) - 1) * Number(limit)

  const [vendors, total] = await Promise.all([
    Vendor.find(filter)
      .populate('userId', 'name email phone')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Vendor.countDocuments(filter),
  ])

  res.json({
    success: true,
    vendors,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  })
}

// PUT /api/admin/vendors/:id/approve
export const approveVendor = async (req, res) => {
  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    { status: 'approved' },
    { new: true }
  ).populate('userId', 'name email')

  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' })

  await sendVendorApproval(vendor.userId.email, vendor.businessName)

  await Notification.create({
    userId: vendor.userId._id,
    type: 'vendor_approved',
    title: 'Vendor Account Approved',
    message: 'Congratulations! Your vendor account has been approved. You can now receive bookings.',
    data: { vendorId: vendor._id },
  })

  res.json({ success: true, message: 'Vendor approved', vendor })
}

// PUT /api/admin/vendors/:id/reject
export const rejectVendor = async (req, res) => {
  const { reason } = req.body
  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected' },
    { new: true }
  ).populate('userId', 'name email')

  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' })

  await sendVendorRejection(vendor.userId.email, vendor.businessName, reason)

  res.json({ success: true, message: 'Vendor rejected', vendor })
}

// PUT /api/admin/vendors/:id/suspend
export const suspendVendor = async (req, res) => {
  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    { status: 'suspended' },
    { new: true }
  )
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' })

  // Also block the user
  await User.findByIdAndUpdate(vendor.userId, { isBlocked: true })

  res.json({ success: true, message: 'Vendor suspended', vendor })
}

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query
  const filter = {}
  if (role) filter.role = role
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ]
  }

  const skip = (Number(page) - 1) * Number(limit)

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ])

  res.json({
    success: true,
    users,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  })
}

// PUT /api/admin/users/:id/block
export const blockUser = async (req, res) => {
  const { block = true } = req.body
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: Boolean(block) },
    { new: true }
  ).select('-password')

  if (!user) return res.status(404).json({ success: false, message: 'User not found' })

  res.json({ success: true, message: `User ${block ? 'blocked' : 'unblocked'}`, user })
}

// GET /api/admin/bookings
export const getAllBookings = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const filter = {}
  if (status) filter.status = status

  const skip = (Number(page) - 1) * Number(limit)

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('userId', 'name email')
      .populate('vendorId', 'businessName')
      .populate('serviceId', 'title price')
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

// GET /api/admin/withdrawals
export const getAllWithdrawals = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const filter = {}
  if (status) filter.status = status

  const skip = (Number(page) - 1) * Number(limit)

  const [withdrawals, total] = await Promise.all([
    Withdrawal.find(filter)
      .populate({ path: 'vendorId', populate: { path: 'userId', select: 'name email' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Withdrawal.countDocuments(filter),
  ])

  res.json({
    success: true,
    withdrawals,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  })
}

// PUT /api/admin/withdrawals/:id/approve
export const approveWithdrawal = async (req, res) => {
  const { transactionId } = req.body
  const withdrawal = await Withdrawal.findByIdAndUpdate(
    req.params.id,
    { status: 'paid', transactionId, processedAt: new Date() },
    { new: true }
  ).populate({ path: 'vendorId', populate: { path: 'userId', select: 'name email' } })

  if (!withdrawal) return res.status(404).json({ success: false, message: 'Withdrawal not found' })

  await sendWithdrawalUpdate(withdrawal.vendorId.userId.email, withdrawal.amount, 'paid')

  res.json({ success: true, message: 'Withdrawal approved and marked as paid', withdrawal })
}

// PUT /api/admin/withdrawals/:id/reject
export const rejectWithdrawal = async (req, res) => {
  const { reason } = req.body
  const withdrawal = await Withdrawal.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', adminNote: reason, processedAt: new Date() },
    { new: true }
  ).populate({ path: 'vendorId', populate: { path: 'userId', select: 'name email' } })

  if (!withdrawal) return res.status(404).json({ success: false, message: 'Withdrawal not found' })

  await sendWithdrawalUpdate(withdrawal.vendorId.userId.email, withdrawal.amount, 'rejected')

  res.json({ success: true, message: 'Withdrawal rejected', withdrawal })
}

// GET /api/admin/reviews
export const getAllReviews = async (req, res) => {
  const { isVisible, page = 1, limit = 20 } = req.query
  const filter = {}
  if (isVisible !== undefined) filter.isVisible = isVisible === 'true'

  const skip = (Number(page) - 1) * Number(limit)

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('userId', 'name email')
      .populate('vendorId', 'businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments(filter),
  ])

  res.json({
    success: true,
    reviews,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  })
}

// PUT /api/admin/reviews/:id/visibility
export const toggleReviewVisibility = async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' })

  review.isVisible = !review.isVisible
  await review.save()

  res.json({ success: true, isVisible: review.isVisible })
}

// DELETE /api/admin/reviews/:id
export const deleteReview = async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id)
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' })
  res.json({ success: true, message: 'Review deleted' })
}

// GET /api/admin/analytics
export const getAnalytics = async (req, res) => {
  const { period = '30d' } = req.query
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [bookingTrend, topVendors, topCategories, userGrowth] = await Promise.all([
    Booking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          bookings: { $sum: 1 },
          revenue: { $sum: '$platformFee' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Vendor.find({ status: 'approved' })
      .sort({ totalBookings: -1 })
      .limit(5)
      .select('businessName totalBookings totalEarnings rating city'),
    Vendor.aggregate([
      { $match: { status: 'approved' } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'cat',
        },
      },
      { $unwind: '$cat' },
      {
        $group: {
          _id: '$cat.name',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: startDate }, role: 'user' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ])

  res.json({ success: true, bookingTrend, topVendors, topCategories, userGrowth })
}

// GET /api/admin/settings
export const getSettings = async (req, res) => {
  // In production these would come from a Settings collection
  res.json({
    success: true,
    settings: {
      platformFeePercent: 5,
      minWithdrawalAmount: 500,
      maxRefundDays: 7,
      otpExpiryMinutes: 10,
      maintenanceMode: false,
    },
  })
}

// PUT /api/admin/settings
export const updateSettings = async (req, res) => {
  // In production, save to Settings collection
  res.json({ success: true, message: 'Settings updated', settings: req.body })
}
