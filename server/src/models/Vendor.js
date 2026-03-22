import mongoose from 'mongoose'

const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    description: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    portfolio: [
      {
        url: { type: String },
        caption: { type: String },
        type: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    pan: { type: String },
    aadhaar: { type: String },
    gst: { type: String },
    documents: [
      {
        name: { type: String },
        url: { type: String },
      },
    ],
    bankAccount: {
      accountNumber: { type: String },
      ifsc: { type: String },
      accountName: { type: String },
      bankName: { type: String },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    planType: {
      type: String,
      enum: ['starter', 'pro', 'elite'],
      default: 'starter',
    },
    planExpiry: {
      type: Date,
    },
    badges: [{ type: String }],
    responseRate: {
      type: Number,
      default: 0,
    },
    avgResponseTime: {
      type: Number,
      default: 0,
    },
    socialLinks: {
      facebook: { type: String },
      instagram: { type: String },
      youtube: { type: String },
    },
    website: { type: String },
    yearsInBusiness: { type: Number },
    phone: { type: String },
    startingPrice: { type: Number },
    teamSize: { type: Number },
    blockedDates: [
      {
        type: Date,
      },
    ],
  },
  { timestamps: true }
)

vendorSchema.index({ location: '2dsphere' })
vendorSchema.index({ status: 1, city: 1 })
vendorSchema.index({ rating: -1, totalBookings: -1 })

const Vendor = mongoose.model('Vendor', vendorSchema)
export default Vendor
