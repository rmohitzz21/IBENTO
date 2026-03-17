import Withdrawal from '../models/Withdrawal.js'
import Vendor from '../models/Vendor.js'
import Booking from '../models/Booking.js'

// GET /api/withdrawals/available-balance
export const getAvailableBalance = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' })

  const pendingWithdrawals = await Withdrawal.aggregate([
    { $match: { vendorId: vendor._id, status: { $in: ['pending', 'approved', 'processing'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])

  const pendingAmount = pendingWithdrawals[0]?.total || 0
  const availableBalance = vendor.totalEarnings - pendingAmount

  res.json({
    success: true,
    totalEarnings: vendor.totalEarnings,
    pendingWithdrawals: pendingAmount,
    availableBalance: Math.max(0, availableBalance),
  })
}

// POST /api/withdrawals
export const requestWithdrawal = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' })

  const { amount } = req.body

  // Check available balance
  const pendingWithdrawals = await Withdrawal.aggregate([
    { $match: { vendorId: vendor._id, status: { $in: ['pending', 'approved', 'processing'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])
  const pendingAmount = pendingWithdrawals[0]?.total || 0
  const availableBalance = vendor.totalEarnings - pendingAmount

  if (amount > availableBalance) {
    return res.status(400).json({
      success: false,
      message: `Insufficient balance. Available: ₹${availableBalance}`,
    })
  }

  if (!vendor.bankAccount?.accountNumber) {
    return res.status(400).json({
      success: false,
      message: 'Please add bank account details before requesting withdrawal',
    })
  }

  const withdrawal = await Withdrawal.create({
    vendorId: vendor._id,
    amount,
    bankAccount: vendor.bankAccount,
    requestedAt: new Date(),
  })

  res.status(201).json({ success: true, message: 'Withdrawal request submitted', withdrawal })
}

// GET /api/withdrawals
export const getWithdrawals = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' })

  const { status, page = 1, limit = 10 } = req.query
  const filter = { vendorId: vendor._id }
  if (status) filter.status = status

  const skip = (Number(page) - 1) * Number(limit)

  const [withdrawals, total] = await Promise.all([
    Withdrawal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Withdrawal.countDocuments(filter),
  ])

  res.json({
    success: true,
    withdrawals,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  })
}
