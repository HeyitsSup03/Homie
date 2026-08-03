import axiosClient from './axiosClient';

export interface MessageSender {
  _id: string;
  name: string;
}

export interface Message {
  _id: string;
  interest: string;
  sender: MessageSender | string;
  recipient: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * POST /api/messages
 * Send a message in an accepted interest thread.
 */
export const sendMessageApi = async (
  interestId: string,
  text: string
): Promise<Message> => {
  const { data } = await axiosClient.post<{ message: Message }>('/messages', {
    interestId,
    text,
  });
  return data.message;
};

/**
 * GET /api/messages/:interestId
 * Fetch messages for an accepted match thread.
 * Supports optional 'after' ISO timestamp for incremental delta fetching.
 */
export const getMessagesApi = async (
  interestId: string,
  after?: string
): Promise<Message[]> => {
  const { data } = await axiosClient.get<{ messages: Message[] }>(
    `/messages/${interestId}`,
    { params: after ? { after } : undefined }
  );
  return data.messages;
};
