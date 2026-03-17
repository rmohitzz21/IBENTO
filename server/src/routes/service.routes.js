import { Router } from 'express'
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
} from '../controllers/service.controller.js'
import { protect, authorize } from '../middleware/auth.js'

const router = Router()

router.get('/', getServices)
router.get('/:id', getServiceById)
router.post('/', protect, authorize('vendor'), createService)
router.put('/:id', protect, authorize('vendor'), updateService)
router.delete('/:id', protect, authorize('vendor'), deleteService)
router.patch('/:id/toggle', protect, authorize('vendor'), toggleServiceStatus)

export default router
