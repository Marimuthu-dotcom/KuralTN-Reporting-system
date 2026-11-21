// Frontend/src/components/community/WardChat.jsx
import React, { useState, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { Lock } from 'lucide-react';
import { AnimatedChat } from '../common/AnimatedIcons';

const LOCAL_WARD_MESSAGES = [
  {
    id: 'msg-local-1',
    ward_id: 'ward-43-thoothukudi',
    sender_user_id: 'user-councillor-senthil',
    sender_name: 'Councillor M. Senthil Nathan',
    sender_role: 'WARD_COUNCILLOR',
    message_text: 'Morning residents — stormwater drain desilting work on Millerpuram 2nd Street begins today at 10 AM.',
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 'msg-local-2',
    ward_id: 'ward-43-thoothukudi',
    sender_user_id: 'user-citizen-anand',
    sender_name: 'Anand Kumar',
    sender_role: 'CITIZEN',
    message_text: 'Thank you! Also flagged the two non-working LED poles near the corner bus stop under CIV-2026-00007.',
    complaint_ref_link: 'CIV-2026-00007',
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'msg-local-3',
    ward_id: 'ward-43-thoothukudi',
    sender_user_id: 'user-department-murugan',
    sender_name: 'Er. K. Murugan',
    sender_role: 'DEPARTMENT_HANDLER',
    message_text: 'Electrical crew has scheduled pole inspection for Millerpuram main road this afternoon.',
    created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
];

export function WardChat({ wardId, wardName }) {
  const { user } = useAuth();
  const { t, isTamil } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restrictionReason, setRestrictionReason] = useState(null);

  // Ward restriction
  const isEligible = Boolean(
    user && (
      user.role === 'ADMIN' ||
      user.role === 'WARD_COUNCILLOR' ||
      user.role === 'ACCOUNTABILITY_REVIEWER' ||
      (user.ward_id === wardId || user.verified_ward_id === wardId)
    )
  );

  useEffect(() => {
    if (!isEligible) {
      setIsLoading(false);
      return;
    }
    setMessages(LOCAL_WARD_MESSAGES);
    setRestrictionReason(null);
    setIsLoading(false);
  }, [wardId, isEligible]);

  const handleSendMessage = (payload) => {
    const localMsg = {
      id: `msg-${Date.now()}`,
      ward_id: wardId,
      sender_user_id: user?.id || 'user-citizen-anand',
      sender_name: user?.full_name || user?.name || 'Resident',
      sender_role: user?.role || 'CITIZEN',
      message_text: payload.message_text,
      complaint_ref_link: payload.complaint_ref_link || null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, localMsg]);
  };

  if (!isEligible || restrictionReason) {
    return (
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-8 text-center space-y-3">
        <div className="p-3 bg-neutral-100 rounded-full w-fit mx-auto text-[#737373]">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-[#171717]">
          {isTamil ? 'வார்டு உரையாடல் கட்டுப்பாடு' : 'Ward Community Restricted'}
        </h3>
        <p className="text-xs text-[#737373] max-w-md mx-auto leading-relaxed">
          {restrictionReason || (isTamil
            ? `இந்த அரங்கம் ${wardName || 'இந்த வார்டு'} பகுதிக்குரியது. பொதுப் புகார்களைப் பார்க்கலாம்; ஆனால் நேரலை உரையாடலில் பங்கேற்க அந்த வார்டில் பதிவுசெய்த உறுப்பினர்களுக்கே அனுமதியுண்டு.`
            : `This community chat belongs to ${wardName || 'this ward'}. You can view public complaints from this ward, but live chat interactions are restricted to verified ward members.`)}
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