// Frontend/src/components/community/MessageList.jsx
import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/dateUtils';
import { Badge } from '../common/Badge';

export function MessageList({ messages = [], currentUserId }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-xs text-[#737373]">
        No messages posted in this ward group yet. Say Vanakkam to your neighbours!
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-3">
      {messages.map((msg) => {
        const isMine = msg.sender_user_id === currentUserId;
        const isCouncillor = msg.sender_role === 'WARD_COUNCILLOR';

        return (
          <div
            key={msg.id}
            className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs ${
                isMine
                  ? 'bg-[#F97316] text-white rounded-br-xs'
                  : isCouncillor
                  ? 'bg-amber-100/90 text-amber-950 border border-amber-300 rounded-bl-xs'
                  : 'bg-white border border-[#E7E5E4] text-[#171717] rounded-bl-xs'
              }`}
            >
              {!isMine && (
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-bold text-[11px] truncate">
                    {msg.sender_name}
                  </span>
                  {isCouncillor && (
                    <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded text-[9px] font-bold uppercase">
                      Councillor
                    </span>
                  )}
                </div>
              )}

              <p className="leading-relaxed whitespace-pre-wrap">{msg.message_text}</p>

              {msg.complaint_ref_link && (
                <div className="mt-1 pt-1 border-t border-black/10">
                  <Link
                    to={`/complaints?search=${msg.complaint_ref_link}`}
                    className={`inline-flex items-center gap-1 font-mono font-bold text-[10px] underline ${
                      isMine ? 'text-white' : 'text-[#F97316]'
                    }`}
                  >
                    Ticket: {msg.complaint_ref_link}
                  </Link>
                </div>
              )}

              <div
                className={`text-[9px] mt-1 text-right ${
                  isMine ? 'text-white/80' : 'text-[#737373]'
                }`}
              >
                {formatDateTime(msg.created_at)}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
