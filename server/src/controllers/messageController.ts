import { Request, Response } from 'express';
import Message from '../models/Message';
import Interest from '../models/Interest';
import asyncHandler from '../utils/asyncHandler';

// POST /api/messages  (authenticated users)
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { interestId, text } = req.body as { interestId?: string; text?: string };

  if (!interestId || !text || !text.trim()) {
    res.status(400).json({ message: 'interestId and non-empty text are required.' });
    return;
  }

  // Find the interest connection
  const interest = await Interest.findById(interestId);
  if (!interest) {
    res.status(404).json({ message: 'Interest connection not found.' });
    return;
  }

  // 🔒 Match Gatekeeper — messaging is ONLY allowed if status is 'accepted'
  if (interest.status !== 'accepted') {
    res.status(403).json({
      message: 'Messaging is strictly allowed for accepted matches only.',
    });
    return;
  }

  // 🔒 Participant check — user must be either the seeker or owner of this interest
  const userIdStr = req.user!._id.toString();
  const seekerIdStr = interest.seeker.toString();
  const ownerIdStr = interest.owner.toString();

  if (userIdStr !== seekerIdStr && userIdStr !== ownerIdStr) {
    res.status(403).json({ message: 'Not authorised to participate in this chat.' });
    return;
  }

  // Determine recipient (the other participant)
  const recipientId = userIdStr === seekerIdStr ? interest.owner : interest.seeker;

  const message = await Message.create({
    interest: interestId,
    sender: req.user!._id,
    recipient: recipientId,
    text: text.trim(),
  });

  await message.populate('sender', 'name');

  res.status(201).json({ message });
});

// GET /api/messages/:interestId  (authenticated users)
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { interestId } = req.params;
  const { after } = req.query as { after?: string };

  const interest = await Interest.findById(interestId);
  if (!interest) {
    res.status(404).json({ message: 'Interest connection not found.' });
    return;
  }

  // 🔒 Match Gatekeeper
  if (interest.status !== 'accepted') {
    res.status(403).json({
      message: 'Messaging is strictly allowed for accepted matches only.',
    });
    return;
  }

  // 🔒 Participant check
  const userIdStr = req.user!._id.toString();
  const seekerIdStr = interest.seeker.toString();
  const ownerIdStr = interest.owner.toString();

  if (userIdStr !== seekerIdStr && userIdStr !== ownerIdStr) {
    res.status(403).json({ message: 'Not authorised to view these messages.' });
    return;
  }

  // Build filter — if 'after' timestamp is provided, fetch only newer messages (delta)
  const filter: any = { interest: interestId };
  if (after) {
    const afterDate = new Date(after);
    if (!isNaN(afterDate.getTime())) {
      filter.createdAt = { $gt: afterDate };
    }
  }

  const messages = await Message.find(filter)
    .populate('sender', 'name')
    .sort({ createdAt: 1 });

  res.status(200).json({ messages });
});
