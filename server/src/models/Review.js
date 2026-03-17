import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    title: { type: String, trim: true },
    comment: { type: String, trim: true },
    photos: [{ type: String }],
    categoryRatings: {
      quality: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
      punctuality: { type: Number, min: 1, max: 5 },
    },
    emojiReactions: {
      clap: { type: Number, default: 0 },
      hundred: { type: Number, default: 0 },
      heart: { type: Number, default: 0 },
      party: { type: Number, default: 0 },
    },
    wouldRecommend: {
      type: Boolean,
      default: true,
    },
    moodEmoji: { type: String },
    vendorReply: { type: String },
    vendorRepliedAt: { type: Date },
    isVisible: {
      type: Boolean,
      default: true,
    },
    aiModScore: { type: Number },
  },
  { timestamps: true }
)

reviewSchema.index({ vendorId: 1, isVisible: 1 })
reviewSchema.index({ userId: 1 })

const Review = mongoose.model('Review', reviewSchema)
export default Review
