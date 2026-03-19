import mongoose from 'mongoose'
import Review from '../models/Review.js'
import Booking from '../models/Booking.js'
import Vendor from '../models/Vendor.js'

// POST /api/reviews
export const createReview = async (req, res) => {
  const {
    bookingId, rating, title, comment,
    photos, categoryRatings, wouldRecommend, moodEmoji,
  } = req.body

  const booking = await Booking.findOne({
    _id: bookingId,
    userId: req.user._id,
    status: 'completed',
  })

  if (!booking) {
    return res.status(400).json({ success: false, message: 'Can only review completed bookings' })
  }

  const existing = await Review.findOne({ bookingId })
  if (existing) {
    return res.status(409).json({ success: false, message: 'Review already submitted for this booking' })
  }

  const review = await Review.create({
    bookingId,
    userId: req.user._id,
    vendorId: booking.vendorId,
    rating,
    title,
    comment,
    photos,
    categoryRatings,
    wouldRecommend,
    moodEmoji,
  })

  await Booking.findByIdAndUpdate(bookingId, { reviewId: review._id })

  // Recalculate vendor rating
  const stats = await Review.aggregate([
    { $match: { vendorId: booking.vendorId, isVisible: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])

  if (stats.length > 0) {
    await Vendor.findByIdAndUpdate(booking.vendorId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    })
  }

  res.status(201).json({ success: true, message: 'Review submitted', review })
}

// GET /api/reviews/vendor/:vendorId
export const getVendorReviews = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  const [reviews, total, stats] = await Promise.all([
    Review.find({ vendorId: req.params.vendorId, isVisible: true })
      .populate('userId', 'name avatar city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ vendorId: req.params.vendorId, isVisible: true }),
    Review.aggregate([
      { $match: { vendorId: new mongoose.Types.ObjectId(req.params.vendorId), isVisible: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
          ratingDist: {
            $push: '$rating',
          },
        },
      },
    ]),
  ])

  res.json({
    success: true,
    reviews,
    stats: stats[0] || { avgRating: 0, count: 0 },
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

// PUT /api/reviews/:id/reply (vendor)
export const replyToReview = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(403).json({ success: false, message: 'Vendor account required' })

  const review = await Review.findOneAndUpdate(
    { _id: req.params.id, vendorId: vendor._id },
    { vendorReply: req.body.reply, vendorRepliedAt: new Date() },
    { new: true }
  )

  if (!review) return res.status(404).json({ success: false, message: 'Review not found' })
  res.json({ success: true, message: 'Reply added', review })
}

// POST /api/reviews/:id/react
export const reactToReview = async (req, res) => {
  const { emoji } = req.body
  const validEmojis = ['clap', 'hundred', 'heart', 'party']
  if (!validEmojis.includes(emoji)) {
    return res.status(400).json({ success: false, message: 'Invalid emoji reaction' })
  }

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $inc: { [`emojiReactions.${emoji}`]: 1 } },
    { new: true }
  )

  if (!review) return res.status(404).json({ success: false, message: 'Review not found' })
  res.json({ success: true, emojiReactions: review.emojiReactions })
}

// DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
  const filter =
    req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.user._id }

  const review = await Review.findOneAndDelete(filter)
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' })

  // Recalculate vendor rating
  const stats = await Review.aggregate([
    { $match: { vendorId: review.vendorId, isVisible: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])

  await Vendor.findByIdAndUpdate(review.vendorId, {
    rating: stats[0]?.avgRating ? Math.round(stats[0].avgRating * 10) / 10 : 0,
    totalReviews: stats[0]?.count || 0,
  })

  res.json({ success: true, message: 'Review deleted' })
}
