import { Router } from 'express'
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  markConversationRead,
} from '../controllers/message.controller.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.get('/conversations', getConversations)
router.get('/conversations/:id', getConversationMessages)
router.post('/send', sendMessage)
router.put('/conversations/:id/read', markConversationRead)

export default router
