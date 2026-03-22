import Vendor from '../models/Vendor.js'
import Service from '../models/Service.js'
import Booking from '../models/Booking.js'
import Review from '../models/Review.js'
import User from '../models/User.js'
import Category from '../models/Category.js'
import { sendVendorApproval } from '../services/email.service.js'
import cloudinary from '../config/cloudinary.js'

// GET /api/vendors — Browse with filters + pagination
export const browseVendors = async (req, res) => {
  const {
    category,
    city,
    minPrice,
    maxPrice,
    minRating,
    isAvailable,
    search,
    sortBy = 'rating',
    page = 1,
    limit = 12,
  } = req.query

  const filter = { status: 'approved' }

  if (category) filter.category = category
  if (city) filter.city = new RegExp(city, 'i')
  if (minRating) filter.rating = { $gte: Number(minRating) }
  if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true'
  if (search) {
    filter.$or = [
      { businessName: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
    ]
  }

  const sortOptions = {
    rating: { rating: -1 },
    bookings: { totalBookings: -1 },
    newest: { createdAt: -1 },
  }

  const skip = (Number(page) - 1) * Number(limit)

  const [vendors, total] = await Promise.all([
    Vendor.find(filter)
      .populate('category', 'name emoji')
      .populate('userId', 'name avatar')
      .sort(sortOptions[sortBy] || { rating: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Vendor.countDocuments(filter),
  ])

  // Fetch min price per vendor
  const vendorIds = vendors.map((v) => v._id)
  const services = await Service.find({ vendorId: { $in: vendorIds }, isActive: true })
    .select('vendorId price')
    .lean()

  const priceMap = {}
  services.forEach((s) => {
    const vid = s.vendorId.toString()
    if (!priceMap[vid] || s.price < priceMap[vid]) priceMap[vid] = s.price
  })

  const enriched = vendors.map((v) => ({
    ...v,
    startingPrice: priceMap[v._id.toString()] || null,
  }))

  // Filter by price if requested
  const filtered = minPrice || maxPrice
    ? enriched.filter((v) => {
        if (!v.startingPrice) return true
        if (minPrice && v.startingPrice < Number(minPrice)) return false
        if (maxPrice && v.startingPrice > Number(maxPrice)) return false
        return true
      })
    : enriched

  res.json({
    success: true,
    vendors: filtered,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  })
}

// GET /api/vendors/trending
export const getTrendingVendors = async (req, res) => {
  const { city } = req.query

  const matchStage = { status: 'approved', isAvailable: true }
  if (city) matchStage.city = new RegExp(city, 'i')

  const vendors = await Vendor.aggregate([
    { $match: matchStage },
    {
      $addFields: {
        trendScore: {
          $add: [
            { $multiply: ['$totalBookings', 0.4] },
            { $multiply: ['$rating', 10] },
            { $multiply: ['$totalReviews', 0.3] },
          ],
        },
      },
    },
    { $sort: { trendScore: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userId',
        pipeline: [{ $project: { name: 1, avatar: 1 } }],
      },
    },
    { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
  ])

  res.json({ success: true, vendors })
}

// GET /api/vendors/:id — Public vendor profile
export const getVendorById = async (req, res) => {
  const vendor = await Vendor.findById(req.params.id)
    .populate('category', 'name emoji')
    .populate('userId', 'name avatar')

  if (!vendor || vendor.status !== 'approved') {
    return res.status(404).json({ success: false, message: 'Vendor not found' })
  }

  res.json({ success: true, vendor })
}

// GET /api/vendors/:id/services
export const getVendorServices = async (req, res) => {
  const services = await Service.find({ vendorId: req.params.id, isActive: true })
    .populate('category', 'name emoji')

  res.json({ success: true, services })
}

// GET /api/vendors/:id/reviews
export const getVendorReviews = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  const [reviews, total] = await Promise.all([
    Review.find({ vendorId: req.params.id, isVisible: true })
      .populate('userId', 'name avatar city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ vendorId: req.params.id, isVisible: true }),
  ])

  res.json({
    success: true,
    reviews,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

// GET /api/vendors/services (authenticated vendor — own services)
export const getMyServices = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' })

  const services = await Service.find({ vendorId: vendor._id }).sort({ createdAt: -1 })
  res.json({ success: true, services })
}

// POST /api/vendors/apply
export const applyAsVendor = async (req, res) => {
  const existing = await Vendor.findOne({ userId: req.user._id })
  if (existing) {
    return res.status(409).json({ success: false, message: 'You have already applied as a vendor' })
  }

  const {
    businessName, category: categoryName, description, city, state,
    phone, startingPrice,
    pan, aadhaar, gst, website, yearsInBusiness, teamSize,
    socialLinks, bankAccount,
  } = req.body

  // Resolve category name string → ObjectId (form sends name, schema stores ObjectId)
  let categoryId = null
  if (categoryName) {
    const cat = await Category.findOne({ name: new RegExp(`^${categoryName}$`, 'i') })
    categoryId = cat?._id || null
  }

  const vendor = await Vendor.create({
    userId: req.user._id,
    businessName,
    category: categoryId,
    description, city, state,
    phone, startingPrice,
    pan, aadhaar, gst, website, yearsInBusiness, teamSize,
    socialLinks, bankAccount,
    status: 'pending',
  })

  // Update role and re-issue access token so the client's JWT reflects role: 'vendor'
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { role: 'vendor' },
    { new: true }
  )
  const { accessToken } = updatedUser.generateTokens()

  res.status(201).json({
    success: true,
    message: 'Vendor application submitted. We will review it within 2-3 business days.',
    vendor,
    accessToken,
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
    },
  })
}

// GET /api/vendors/dashboard
export const getVendorDashboard = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' })

  const [recentBookings, monthlyEarnings] = await Promise.all([
    Booking.find({ vendorId: vendor._id })
      .populate('userId', 'name avatar phone')
      .populate('serviceId', 'title')
      .sort({ createdAt: -1 })
      .limit(5),

    Booking.aggregate([
      {
        $match: {
          vendorId: vendor._id,
          paymentStatus: { $in: ['advance-paid', 'fully-paid'] },
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          earnings: { $sum: '$netVendorAmount' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ])

  res.json({
    success: true,
    stats: {
      totalBookings: vendor.totalBookings,
      totalEarnings: vendor.totalEarnings,
      avgRating: vendor.rating,
      totalReviews: vendor.totalReviews,
      isAvailable: vendor.isAvailable,
      planType: vendor.planType,
    },
    recentBookings,
    monthlyEarnings,
    vendor,
  })
}

// PUT /api/vendors/profile
export const updateVendorProfile = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' })

  const scalarFields = [
    'businessName', 'description', 'city', 'state', 'website',
    'yearsInBusiness', 'teamSize', 'socialLinks', 'bankAccount',
    'phone', 'startingPrice', 'pan', 'aadhaar', 'gst', 'portfolio',
  ]

  scalarFields.forEach((field) => {
    if (req.body[field] !== undefined) vendor[field] = req.body[field]
  })

  // Resolve category name → ObjectId
  if (req.body.category) {
    const cat = await Category.findOne({ name: new RegExp(`^${req.body.category}$`, 'i') })
    if (cat) vendor.category = cat._id
  }

  await vendor.save()
  res.json({ success: true, message: 'Profile updated', vendor })
}

// GET /api/vendors/bookings
export const getVendorBookings = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' })

  const { status, page = 1, limit = 10 } = req.query
  const filter = { vendorId: vendor._id }
  if (status) filter.status = status

  const skip = (Number(page) - 1) * Number(limit)

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('userId', 'name avatar phone email')
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

// GET /api/vendors/earnings
export const getVendorEarnings = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' })

  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const [breakdown, pendingResult] = await Promise.all([
    Booking.aggregate([
      {
        $match: {
          vendorId: vendor._id,
          paymentStatus: { $in: ['advance-paid', 'fully-paid'] },
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          gross: { $sum: '$totalAmount' },
          net: { $sum: '$netVendorAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Booking.aggregate([
      {
        $match: {
          vendorId: vendor._id,
          status: { $in: ['confirmed', 'pending'] },
          paymentStatus: { $nin: ['fully-paid'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ])

  const thisMonthEntry = breakdown.find(
    (e) => e._id.year === now.getFullYear() && e._id.month === now.getMonth() + 1
  )

  res.json({
    success: true,
    totalEarnings: vendor.totalEarnings,
    thisMonth: thisMonthEntry?.net || 0,
    pendingAmount: pendingResult[0]?.total || 0,
    breakdown,
  })
}

// PUT /api/vendors/availability
export const updateAvailability = async (req, res) => {
  const { isAvailable, blockedDates } = req.body
  const update = {}
  if (typeof isAvailable === 'boolean') update.isAvailable = isAvailable
  if (Array.isArray(blockedDates)) {
    // Normalize all dates to midnight UTC to avoid time-zone drift
    update.blockedDates = blockedDates.map((d) => {
      const date = new Date(d)
      date.setHours(0, 0, 0, 0)
      return date
    })
  }

  const vendor = await Vendor.findOneAndUpdate(
    { userId: req.user._id },
    update,
    { new: true }
  )
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' })
  res.json({ success: true, isAvailable: vendor.isAvailable, blockedDates: vendor.blockedDates })
}

// GET /api/vendors/calendar
export const getVendorCalendar = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' })

  const { month, year } = req.query
  const startDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth() + 1) - 1, 1)
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)

  const bookings = await Booking.find({
    vendorId: vendor._id,
    eventDate: { $gte: startDate, $lte: endDate },
    status: { $in: ['confirmed', 'pending'] },
  }).select('eventDate status bookingNumber userId')
    .populate('userId', 'name')

  res.json({ success: true, bookings, blockedDates: vendor.blockedDates || [] })
}

// GET /api/vendors/leads
export const getVendorLeads = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' })

  const leads = await Booking.find({
    vendorId: vendor._id,
    status: 'pending',
  })
    .populate('userId', 'name avatar phone email city')
    .populate('serviceId', 'title price')
    .sort({ createdAt: -1 })

  res.json({ success: true, leads })
}

// GET /api/vendors/my-reviews
export const getMyReviews = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' })

  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const skip = (page - 1) * limit

  const [reviews, total] = await Promise.all([
    Review.find({ vendorId: vendor._id, isVisible: true })
      .populate('userId', 'name avatar')
      .populate({ path: 'bookingId', populate: { path: 'serviceId', select: 'name title' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ vendorId: vendor._id, isVisible: true }),
  ])

  res.json({ success: true, reviews, total, avgRating: vendor.rating, totalReviews: vendor.totalReviews })
}

// POST /api/vendors/leads/:id/respond
export const respondToLead = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' })

  const { action, note } = req.body
  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Action must be accept or reject' })
  }

  const booking = await Booking.findOne({ _id: req.params.id, vendorId: vendor._id })
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

  booking.status = action === 'accept' ? 'confirmed' : 'rejected'
  if (note) booking.vendorNote = note
  await booking.save()

  if (req.io) {
    req.io.to(`user-${booking.userId}`).emit('booking:update', {
      bookingId: booking._id,
      status: booking.status,
    })
  }

  res.json({ success: true, message: `Booking ${booking.status}`, booking })
}

// POST /api/vendors/calendar/block
export const blockCalendarDate = async (req, res) => {
  const { date } = req.body
  if (!date) return res.status(400).json({ success: false, message: 'Date is required' })

  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' })

  const blockDate = new Date(date)
  blockDate.setHours(0, 0, 0, 0)

  // Check if date has a confirmed booking
  const confirmedBooking = await Booking.findOne({
    vendorId: vendor._id,
    eventDate: blockDate,
    status: { $in: ['confirmed', 'pending'] },
  })
  if (confirmedBooking) {
    return res.status(409).json({
      success: false,
      message: 'Cannot block a date that already has a confirmed booking.',
    })
  }

  // Avoid duplicate blocks
  const alreadyBlocked = vendor.blockedDates.some(
    (d) => new Date(d).toDateString() === blockDate.toDateString()
  )
  if (alreadyBlocked) {
    return res.status(409).json({ success: false, message: 'Date is already blocked' })
  }

  vendor.blockedDates.push(blockDate)
  await vendor.save()

  res.json({ success: true, message: 'Date blocked successfully', blockedDates: vendor.blockedDates })
}

// DELETE /api/vendors/calendar/:dateId  (dateId = ISO date string, URL-encoded)
export const unblockCalendarDate = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' })

  const dateToRemove = new Date(decodeURIComponent(req.params.dateId))
  if (isNaN(dateToRemove)) {
    return res.status(400).json({ success: false, message: 'Invalid date format' })
  }

  const originalCount = vendor.blockedDates.length
  vendor.blockedDates = vendor.blockedDates.filter(
    (d) => new Date(d).toDateString() !== dateToRemove.toDateString()
  )

  if (vendor.blockedDates.length === originalCount) {
    return res.status(404).json({ success: false, message: 'Date not found in blocked list' })
  }

  await vendor.save()
  res.json({ success: true, message: 'Date unblocked successfully', blockedDates: vendor.blockedDates })
}
