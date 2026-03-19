import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
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
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    eventType: { type: String },
    eventAddress: { type: String },
    guestCount: { type: Number },
    specialRequests: { type: String },
    totalAmount: { type: Number },
    advanceAmount: { type: Number },
    remainingAmount: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'advance-paid', 'fully-paid', 'refunded'],
      default: 'pending',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    cancelReason: { type: String },
    vendorNote: { type: String },
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
    addOns: [
      {
        name: { type: String },
        price: { type: Number },
      },
    ],
    couponCode: { type: String },
    discount: {
      type: Number,
      default: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    netVendorAmount: { type: Number },
    invoiceUrl: { type: String },
  },
  { timestamps: true }
)

// Pre-save: generate bookingNumber for new documents
bookingSchema.pre('save', async function () {
  if (!this.isNew || this.bookingNumber) return
  const year = new Date().getFullYear()
  const count = await mongoose.model('Booking').countDocuments()
  const padded = String(count + 1).padStart(5, '0')
  this.bookingNumber = `IBK-${year}-${padded}`
})

bookingSchema.index({ userId: 1, createdAt: -1 })
bookingSchema.index({ vendorId: 1, eventDate: 1 })
bookingSchema.index({ status: 1 })

const Booking = mongoose.model('Booking', bookingSchema)
export default Booking
