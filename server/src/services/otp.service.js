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

  return otp // return plaintext so it can be sent to user
}

export const verifyOTP = async (identifier, purpose, plainOTP) => {
  const record = await OTP.findOne({ identifier, purpose })
  if (!record) throw new Error('OTP not found or expired')

  if (record.expiresAt < new Date()) {
    await OTP.deleteOne({ _id: record._id })
    throw new Error('OTP expired. Please request a new one.')
  }

  if (record.attempts >= 3) {
    throw new Error('Too many incorrect attempts. Please request a new OTP.')
  }

  const isMatch = await bcrypt.compare(plainOTP.toString(), record.otp)
  if (!isMatch) {
    record.attempts += 1
    await record.save()
    const remaining = 3 - record.attempts
    throw new Error(`Invalid OTP. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'No attempts remaining.'}`)
  }

  await OTP.deleteOne({ _id: record._id })
  return true
}
