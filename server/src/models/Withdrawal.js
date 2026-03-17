import mongoose from 'mongoose'

const withdrawalSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Withdrawal amount is required'],
      min: 1,
    },
    bankAccount: {
      accountNumber: { type: String },
      ifsc: { type: String },
      accountName: { type: String },
      bankName: { type: String },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'processing', 'paid'],
      default: 'pending',
    },
    adminNote: { type: String },
    transactionId: { type: String },
    processedAt: { type: Date },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

withdrawalSchema.index({ vendorId: 1, status: 1 })

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema)
export default Withdrawal
