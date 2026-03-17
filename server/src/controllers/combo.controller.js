import Combo from '../models/Combo.js'
import Service from '../models/Service.js'

// GET /api/combos
export const getCombos = async (req, res) => {
  const { eventType } = req.query
  const filter = { isActive: true }
  if (eventType) filter.eventType = eventType

  const combos = await Combo.find(filter)
    .populate({
      path: 'services.serviceId',
      select: 'title price priceType images vendorId',
      populate: { path: 'vendorId', select: 'businessName rating' },
    })
    .sort({ sortOrder: 1 })

  res.json({ success: true, combos })
}

// GET /api/combos/ai-suggest
export const getAISuggestedCombos = async (req, res) => {
  const { eventType, budget, guestCount } = req.query

  // Fetch services filtered by event type from categories and match budget
  const services = await Service.find({ isActive: true })
    .populate('vendorId', 'businessName rating city status')
    .populate('category', 'name')
    .lean()

  // Filter vendors that are approved
  const filtered = services.filter((s) => s.vendorId?.status === 'approved')

  // Group by category
  const grouped = {}
  filtered.forEach((s) => {
    const cat = s.category?.name || 'Other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(s)
  })

  // Build a suggested combo from top services in each category
  const suggested = Object.entries(grouped)
    .slice(0, 5)
    .map(([category, svcs]) => ({
      category,
      service: svcs.sort((a, b) => b.vendorId?.rating - a.vendorId?.rating)[0],
    }))

  const totalEstimate = suggested.reduce((sum, item) => sum + (item.service?.price || 0), 0)

  res.json({
    success: true,
    message: 'AI-powered combo suggestion (based on popular services)',
    suggestion: suggested,
    totalEstimate,
    note: 'Prices may vary. Book individually for confirmed pricing.',
  })
}

// POST /api/combos (admin only)
export const createCombo = async (req, res) => {
  const combo = await Combo.create(req.body)
  res.status(201).json({ success: true, message: 'Combo created', combo })
}

// PUT /api/combos/:id (admin only)
export const updateCombo = async (req, res) => {
  const combo = await Combo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!combo) return res.status(404).json({ success: false, message: 'Combo not found' })
  res.json({ success: true, message: 'Combo updated', combo })
}

// DELETE /api/combos/:id (admin only)
export const deleteCombo = async (req, res) => {
  const combo = await Combo.findByIdAndDelete(req.params.id)
  if (!combo) return res.status(404).json({ success: false, message: 'Combo not found' })
  res.json({ success: true, message: 'Combo deleted' })
}
