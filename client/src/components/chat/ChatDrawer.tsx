import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMessagesApi, sendMessageApi, Message } from '../../api/messageApi';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  interestId: string;
  partnerName: string;
  listingTitle?: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  interestId,
  partnerName,
  listingTitle,
}) => {
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const lastTimestampRef = useRef<string | undefined>(undefined);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Tab-Visibility Aware + Non-Overlapping Delta Polling Effect
  useEffect(() => {
    if (!isOpen || !interestId) return;

    let cancelled = false;
    lastTimestampRef.current = undefined; // Reset timestamp on drawer open

    const pollStep = async () => {
      // 1. Pause polling if browser tab is hidden/inactive
      if (document.hidden) {
        if (!cancelled) {
          timerRef.current = setTimeout(pollStep, 3000);
        }
        return;
      }

      try {
        const lastTs = lastTimestampRef.current;
        const newMsgs = await getMessagesApi(interestId, lastTs);

        if (!cancelled) {
          if (!lastTs) {
            // Initial load — set full history
            setMessages(newMsgs);
            if (newMsgs.length > 0) {
              lastTimestampRef.current = newMsgs[newMsgs.length - 1].createdAt;
            }
          } else if (newMsgs.length > 0) {
            // Delta update — append new messages only
            setMessages(prev => [...prev, ...newMsgs]);
            lastTimestampRef.current = newMsgs[newMsgs.length - 1].createdAt;
          }
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message ?? 'Failed to load messages.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          // 2. Non-overlapping loop: Wait 3s after current request completes before next poll
          timerRef.current = setTimeout(pollStep, 3000);
        }
      }
    };

    setIsLoading(true);
    pollStep();

    // Handle tab visibility change (resume instantly when tab regains focus)
    const handleVisibilityChange = () => {
      if (!document.hidden && isOpen && !cancelled) {
        if (timerRef.current) clearTimeout(timerRef.current);
        pollStep();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Cleanup on close: Cancel timer completely (0 polling when drawer is closed)
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpen, interestId]);

  // Update lastTimestampRef if a message was just sent locally
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isSending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const newMsg = await sendMessageApi(interestId, textToSend);
      setMessages(prev => [...prev, newMsg]);
      lastTimestampRef.current = newMsg.createdAt;
      scrollToBottom();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
      {/* Drawer Container */}
      <div className="w-full max-w-[420px] bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="px-5 py-4 bg-[#faf9f6] border-b border-[#f0ede8] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#4A7546] text-white font-bold flex items-center justify-center text-[0.95rem]">
              {partnerName[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <h3 className="text-[0.95rem] font-bold text-[#1a1a1a] leading-tight">
                {partnerName}
              </h3>
              {listingTitle && (
                <p className="text-[0.72rem] text-[#888] line-clamp-1">
                  {listingTitle}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#eae7e1] flex items-center justify-center text-[1.1rem] text-[#666] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#fcfbf9] flex flex-col gap-3">
          {isLoading && (
            <div className="flex items-center justify-center h-full text-[0.82rem] text-[#aaa]">
              Loading conversation…
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[0.8rem] text-center">
              {error}
            </div>
          )}

          {!isLoading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-[0.85rem] font-bold text-[#1a1a1a] mb-1">Match Unlocked!</p>
              <p className="text-[0.78rem] text-[#888] max-w-[240px]">
                Start the conversation with {partnerName}. Send a friendly hello!
              </p>
            </div>
          )}

          {!isLoading &&
            messages.map(msg => {
              const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
              const userId = (user as any)?._id || user?.id;
              const isMine = senderId === userId;
              const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg._id}
                  className={`flex flex-col max-w-[80%] ${isMine ? 'self-end items-end' : 'self-start items-start'
                    }`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-[18px] text-[0.85rem] leading-relaxed break-words shadow-sm ${isMine
                        ? 'bg-[#4A7546] text-white rounded-br-[4px]'
                        : 'bg-white text-[#1a1a1a] border border-[#f0ede8] rounded-bl-[4px]'
                      }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[0.65rem] text-[#aaa] mt-1 px-1">
                    {timeStr}
                  </span>
                </div>
              );
            })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-[#f0ede8] flex items-center gap-2 flex-shrink-0"
        >
          <textarea
            rows={1}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            className="flex-1 px-4 py-2.5 text-[0.85rem] border border-[#e0dcd5] rounded-2xl bg-[#faf9f6] focus:outline-none focus:border-[#4A7546] resize-none transition-colors max-h-[100px]"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="w-10 h-10 rounded-full bg-[#4A7546] text-white flex items-center justify-center hover:bg-[#3a5e37] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0 shadow-sm"
          >
            ➔
          </button>
        </form>
      </div>
    </div>
  );
};
