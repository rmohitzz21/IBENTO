import { Router } from 'express'
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  checkoutCart,
} from '../controllers/cart.controller.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.get('/', getCart)
router.post('/add', addToCart)
router.delete('/clear', clearCart)
router.delete('/remove/:serviceId', removeFromCart)
router.post('/checkout', checkoutCart)

export default router
