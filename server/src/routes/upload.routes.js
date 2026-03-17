import { Router } from 'express'
import {
  uploadSingle as uploadSingleFile,
  uploadMultiple as uploadMultipleFiles,
  deleteFile,
} from '../controllers/upload.controller.js'
import { protect } from '../middleware/auth.js'
import { uploadSingle, uploadMultiple } from '../middleware/upload.js'

const router = Router()

router.use(protect)

router.post('/single', uploadSingle, uploadSingleFile)
router.post('/multiple', uploadMultiple, uploadMultipleFiles)
router.delete('/:publicId', deleteFile)

export default router
