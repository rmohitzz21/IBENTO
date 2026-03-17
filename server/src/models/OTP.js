import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: [true, 'Identifier (email or phone) is required'],
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
  },
  purpose: {
    type: String,
    enum: ['register', 'login', 'reset-password', 'bank-verify'],
    required: [true, 'Purpose is required'],
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 },
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

otpSchema.index({ identifier: 1, purpose: 1 })

const OTP = mongoose.model('OTP', otpSchema)
export default OTP
