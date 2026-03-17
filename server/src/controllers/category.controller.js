import Category from '../models/Category.js'

// GET /api/categories
export const getCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 })
  res.json({ success: true, categories })
}

// POST /api/categories (admin only)
export const createCategory = async (req, res) => {
  const category = await Category.create(req.body)
  res.status(201).json({ success: true, message: 'Category created', category })
}

// PUT /api/categories/:id (admin only)
export const updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' })
  res.json({ success: true, message: 'Category updated', category })
}

// DELETE /api/categories/:id (admin only)
export const deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id)
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' })
  res.json({ success: true, message: 'Category deleted' })
}

// PUT /api/categories/reorder (admin only)
export const reorderCategories = async (req, res) => {
  const { order } = req.body // [{ id, sortOrder }]
  if (!Array.isArray(order)) {
    return res.status(400).json({ success: false, message: 'Order must be an array' })
  }

  const bulkOps = order.map(({ id, sortOrder }) => ({
    updateOne: {
      filter: { _id: id },
      update: { sortOrder },
    },
  }))

  await Category.bulkWrite(bulkOps)
  res.json({ success: true, message: 'Categories reordered' })
}
