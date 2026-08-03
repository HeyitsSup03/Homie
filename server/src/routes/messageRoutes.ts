import { Router } from 'express';
import { sendMessage, getMessages } from '../controllers/messageController';
import auth from '../middleware/auth';

const router = Router();

// POST /api/messages — send a message (match-gated)
router.post('/', auth, sendMessage);

// GET /api/messages/:interestId — get chat history (match-gated)
router.get('/:interestId', auth, getMessages);

export default router;
