import { Router } from 'express'
import {
  getCombos,
  getAISuggestedCombos,
  createCombo,
  updateCombo,
  deleteCombo,
} from '../controllers/combo.controller.js'
import { protect, authorize } from '../middleware/auth.js'

const router = Router()

router.get('/', getCombos)
router.get('/ai-suggest', getAISuggestedCombos)

router.post('/', protect, authorize('admin'), createCombo)
router.put('/:id', protect, authorize('admin'), updateCombo)
router.delete('/:id', protect, authorize('admin'), deleteCombo)

export default router
