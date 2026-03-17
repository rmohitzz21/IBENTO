import Service from '../models/Service.js'
import Vendor from '../models/Vendor.js'

// GET /api/services
export const getServices = async (req, res) => {
  const { category, vendorId, minPrice, maxPrice, page = 1, limit = 12 } = req.query

  const filter = { isActive: true }
  if (category) filter.category = category
  if (vendorId) filter.vendorId = vendorId
  if (minPrice || maxPrice) {
    filter.price = {}
    if (minPrice) filter.price.$gte = Number(minPrice)
    if (maxPrice) filter.price.$lte = Number(maxPrice)
  }

  const skip = (Number(page) - 1) * Number(limit)

  const [services, total] = await Promise.all([
    Service.find(filter)
      .populate('vendorId', 'businessName rating city isAvailable')
      .populate('category', 'name emoji')
      .sort({ bookingCount: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Service.countDocuments(filter),
  ])

  res.json({
    success: true,
    services,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  })
}

// GET /api/services/:id
export const getServiceById = async (req, res) => {
  const service = await Service.findById(req.params.id)
    .populate('vendorId', 'businessName rating city description isAvailable portfolio badges')
    .populate('category', 'name emoji')

  if (!service) return res.status(404).json({ success: false, message: 'Service not found' })
  res.json({ success: true, service })
}

// POST /api/services (vendor only)
export const createService = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id, status: 'approved' })
  if (!vendor) return res.status(403).json({ success: false, message: 'Approved vendor account required' })

  const service = await Service.create({ ...req.body, vendorId: vendor._id })
  res.status(201).json({ success: true, message: 'Service created', service })
}

// PUT /api/services/:id (vendor only)
export const updateService = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(403).json({ success: false, message: 'Vendor account required' })

  const service = await Service.findOneAndUpdate(
    { _id: req.params.id, vendorId: vendor._id },
    req.body,
    { new: true, runValidators: true }
  )

  if (!service) return res.status(404).json({ success: false, message: 'Service not found' })
  res.json({ success: true, message: 'Service updated', service })
}

// DELETE /api/services/:id (vendor only)
export const deleteService = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(403).json({ success: false, message: 'Vendor account required' })

  const service = await Service.findOneAndDelete({ _id: req.params.id, vendorId: vendor._id })
  if (!service) return res.status(404).json({ success: false, message: 'Service not found' })

  res.json({ success: true, message: 'Service deleted' })
}

// PATCH /api/services/:id/toggle (vendor only)
export const toggleServiceStatus = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
  if (!vendor) return res.status(403).json({ success: false, message: 'Vendor account required' })

  const service = await Service.findOne({ _id: req.params.id, vendorId: vendor._id })
  if (!service) return res.status(404).json({ success: false, message: 'Service not found' })

  service.isActive = !service.isActive
  await service.save()

  res.json({ success: true, isActive: service.isActive, message: `Service ${service.isActive ? 'activated' : 'deactivated'}` })
}
