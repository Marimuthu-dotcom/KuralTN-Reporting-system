// Frontend/src/components/community/MessageInput.jsx
import React, { useState } from 'react';
import { Send, Link as LinkIcon } from 'lucide-react';
import { Button } from '../common/Button';

export function MessageInput({ onSendMessage, disabled = false }) {
  const [text, setText] = useState('');
  const [complaintRef, setComplaintRef] = useState('');
  const [showRefInput, setShowRefInput] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onSendMessage({
      message_text: text.trim(),
      complaint_ref_link: complaintRef.trim() || null,
    });

    setText('');
    setComplaintRef('');
    setShowRefInput(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-[#E7E5E4] space-y-2">
      {showRefInput && (
        <div className="flex items-center gap-2 px-3 py-1 bg-orange-50/60 rounded-lg border border-orange-200">
          <LinkIcon className="w-3.5 h-3.5 text-[#F97316]" />
          <input
            type="text"
            placeholder="Complaint Ref link (e.g. CIV-2026-00043)"
            value={complaintRef}
            onChange={(e) => setComplaintRef(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none text-[#171717] font-mono"
          />
          <button
            type="button"
            onClick={() => {
              setComplaintRef('');
              setShowRefInput(false);
            }}
            className="text-xs text-[#737373] hover:text-[#171717]"
          >
            &times;
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowRefInput(!showRefInput)}
          title="Link complaint ticket"
          className="p-2 text-[#737373] hover:text-[#F97316] rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          placeholder={disabled ? 'Chat restricted to ward members' : 'Type a community message...'}
          className="flex-1 text-sm bg-neutral-50 border border-[#E7E5E4] rounded-lg px-3 py-2 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#F97316] placeholder:text-[#A8A29E]"
        />

        <Button
          type="submit"
          variant="primary"
          size="sm"
          icon={Send}
          disabled={disabled || !text.trim()}
        >
          Send
        </Button>
      </div>
    </form>
  );
}
