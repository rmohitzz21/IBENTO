import bcrypt from 'bcryptjs'
import OTP from '../models/OTP.js'

export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

export const saveOTP = async (identifier, purpose) => {
  const otp = generateOTP()
  const hashed = await bcrypt.hash(otp, 10)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min
  await OTP.findOneAndUpdate(
    { identifier, purpose },
    { otp: hashed, expiresAt, attempts: 0 },
    { upsert: true, new: true }
  )
  return otp // return plain OTP to send to user
}

export const verifyOTP = async (identifier, purpose, plainOTP) => {
  const record = await OTP.findOne({ identifier, purpose })
  if (!record) throw new Error('OTP not found or expired')
  if (record.expiresAt < new Date()) {
    await OTP.deleteOne({ _id: record._id })
    throw new Error('OTP expired')
  }
  if (record.attempts >= 3) throw new Error('Too many attempts')

  const isMatch = await bcrypt.compare(plainOTP, record.otp)
  if (!isMatch) {
    record.attempts += 1
    await record.save()
    throw new Error('Invalid OTP')
  }
  await OTP.deleteOne({ _id: record._id })
  return true
}
