import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    priceType: {
      type: String,
      enum: ['fixed', 'hourly', 'daily', 'custom', 'per-plate'],
      default: 'fixed',
    },
    images: [{ type: String }],
    duration: { type: String },
    includes: [{ type: String }],
    notIncludes: [{ type: String }],
    addOns: [
      {
        name: { type: String },
        price: { type: Number },
      },
    ],
    minAdvancePercent: {
      type: Number,
      default: 30,
      min: 0,
      max: 100,
    },
    minBookingDays: {
      type: Number,
      default: 7,
    },
    maxBookingsPerMonth: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bookingCount: {
      type: Number,
      default: 0,
    },
    serviceAreas: [{ type: String }],
  },
  { timestamps: true }
)

serviceSchema.index({ vendorId: 1, isActive: 1 })
serviceSchema.index({ category: 1, price: 1 })

const Service = mongoose.model('Service', serviceSchema)
export default Service
