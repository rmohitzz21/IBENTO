import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'vendor', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      trim: true,
    },
    dob: {
      type: Date,
    },
    preferredCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    fcmToken: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
      },
    ],
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Virtual: fullName (alias for name)
userSchema.virtual('fullName').get(function () {
  return this.name
})

// Pre-save hook: hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Instance method: compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Instance method: generate access + refresh tokens
userSchema.methods.generateTokens = function () {
  const accessToken = jwt.sign(
    { id: this._id, role: this.role, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  )

  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  )

  return { accessToken, refreshToken }
}

const User = mongoose.model('User', userSchema)
export default User
