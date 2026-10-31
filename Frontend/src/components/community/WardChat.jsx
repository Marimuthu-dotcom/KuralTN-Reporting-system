// Frontend/src/components/community/WardChat.jsx
import React, { useState, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { communityService } from '../../services/communityService';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useLanguage } from '../../hooks/useLanguage';
import { Lock } from 'lucide-react';
import { AnimatedChat } from '../common/AnimatedIcons';

export function WardChat({ wardId, wardName }) {
  const { user } = useAuth();
  const socket = useSocket();
  const { t, isTamil } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ward restriction
  const isEligible = user && (user.role === 'ADMIN' || user.ward_id === wardId);

  useEffect(() => {
    let isMounted = true;
    async function loadChat() {
      if (!isEligible) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await communityService.getMessages(wardId);
        if (isMounted) setMessages(data || []);
      } catch (err) {
        console.error('Failed to load ward messages:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadChat();

    // Socket room listeners
    if (socket && isEligible) {
      socket.emit('join_ward', { wardId });

      const handleNewMessage = (msg) => {
        if (msg.ward_id === wardId) {
          setMessages((prev) => [...prev, msg]);
        }
      };

      socket.on('new_ward_message', handleNewMessage);

      return () => {
        socket.emit('leave_ward', { wardId });
        socket.off('new_ward_message', handleNewMessage);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [wardId, isEligible, socket]);

  const handleSendMessage = async (payload) => {
    try {
      const newMsg = await communityService.sendMessage(wardId, payload);
      setMessages((prev) => [...prev, newMsg]);
    } catch (err) {
      alert(err.response?.data?.message || (isTamil ? 'செய்தி அனுப்ப முடியவில்லை' : 'Failed to send message'));
    }
  };

  if (!isEligible) {
    return (
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-8 text-center space-y-3">
        <div className="p-3 bg-neutral-100 rounded-full w-fit mx-auto text-[#737373]">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-[#171717]">
          {isTamil ? 'வார்டு உரையாடல் கட்டுப்பாடு' : 'Ward Community Restricted'}
        </h3>
        <p className="text-xs text-[#737373] max-w-md mx-auto leading-relaxed">
          {isTamil
            ? `இந்த அரங்கம் ${wardName} பகுதிக்குரியது. பொதுப் புகார்களைப் பார்க்கலாம்; ஆனால் நேரலை உரையாடலில் பங்கேற்க அந்த வார்டில் பதிவுசெய்த உறுப்பினர்களுக்கே அனுமதியுண்டு.`
            : `This community chat belongs to ${wardName}. You can view public complaints from this ward, but live chat interactions are restricted to verified ward members.`}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-xs flex flex-col h-[520px] overflow-hidden">
      {/* Header */}
      <div className="p-3.5 bg-[#FAF9F6] border-b border-[#E7E5E4] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AnimatedChat className="w-5 h-5 text-[#F97316]" />
          <div>
            <h3 className="text-xs font-bold text-[#171717]">
              {wardName} {isTamil ? 'நேரலை மக்கள் கலந்துரையாடல்' : 'Live Discussion'}
            </h3>
            <span className="text-[10px] text-[#15803D] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-ping" />
              {t('realTimeChannel')}
            </span>
          </div>
        </div>
      </div>

      {/* Message scroll list */}
      <MessageList messages={messages} currentUserId={user?.id} />

      {/* Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}
