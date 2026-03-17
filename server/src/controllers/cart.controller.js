import Cart from '../models/Cart.js'
import Service from '../models/Service.js'

// GET /api/cart
export const getCart = async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user._id })
    .populate({
      path: 'items.serviceId',
      select: 'title price priceType images isActive',
    })
    .populate({
      path: 'items.vendorId',
      select: 'businessName rating city',
    })

  if (!cart) {
    cart = { items: [], totalAmount: 0 }
  }

  res.json({ success: true, cart })
}

// POST /api/cart/add
export const addToCart = async (req, res) => {
  const { serviceId, quantity = 1, addOns = [] } = req.body

  const service = await Service.findById(serviceId).populate('vendorId')
  if (!service || !service.isActive) {
    return res.status(404).json({ success: false, message: 'Service not found or inactive' })
  }

  let cart = await Cart.findOne({ userId: req.user._id })

  if (!cart) {
    cart = new Cart({ userId: req.user._id, items: [], totalAmount: 0 })
  }

  const existingIdx = cart.items.findIndex((item) => item.serviceId.toString() === serviceId)

  if (existingIdx > -1) {
    cart.items[existingIdx].quantity = quantity
    cart.items[existingIdx].addOns = addOns
  } else {
    cart.items.push({ serviceId, vendorId: service.vendorId._id, quantity, addOns })
  }

  // Recalculate total
  const serviceIds = cart.items.map((i) => i.serviceId)
  const services = await Service.find({ _id: { $in: serviceIds } }).select('price _id')
  const priceMap = {}
  services.forEach((s) => { priceMap[s._id.toString()] = s.price })

  cart.totalAmount = cart.items.reduce((sum, item) => {
    const base = (priceMap[item.serviceId.toString()] || 0) * item.quantity
    const addOnTotal = (item.addOns || []).reduce((a, b) => a + (b.price || 0), 0)
    return sum + base + addOnTotal
  }, 0)

  cart.updatedAt = new Date()
  await cart.save()

  res.json({ success: true, message: 'Item added to cart', cart })
}

// DELETE /api/cart/remove/:serviceId
export const removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id })
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' })

  cart.items = cart.items.filter((item) => item.serviceId.toString() !== req.params.serviceId)

  // Recalculate total
  const serviceIds = cart.items.map((i) => i.serviceId)
  const services = await Service.find({ _id: { $in: serviceIds } }).select('price _id')
  const priceMap = {}
  services.forEach((s) => { priceMap[s._id.toString()] = s.price })

  cart.totalAmount = cart.items.reduce((sum, item) => {
    const base = (priceMap[item.serviceId.toString()] || 0) * item.quantity
    const addOnTotal = (item.addOns || []).reduce((a, b) => a + (b.price || 0), 0)
    return sum + base + addOnTotal
  }, 0)

  cart.updatedAt = new Date()
  await cart.save()

  res.json({ success: true, message: 'Item removed from cart', cart })
}

// DELETE /api/cart/clear
export const clearCart = async (req, res) => {
  await Cart.findOneAndUpdate(
    { userId: req.user._id },
    { items: [], totalAmount: 0, updatedAt: new Date() }
  )
  res.json({ success: true, message: 'Cart cleared' })
}

// POST /api/cart/checkout
export const checkoutCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id }).populate('items.serviceId')
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' })
  }

  // Return cart summary for the client to initiate individual bookings
  res.json({
    success: true,
    message: 'Proceed to create individual bookings for each cart item',
    cartSummary: {
      items: cart.items,
      totalAmount: cart.totalAmount,
    },
  })
}
