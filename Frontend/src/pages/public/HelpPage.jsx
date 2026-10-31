// Frontend/src/pages/public/HelpPage.jsx
import React from 'react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { AnimatedShield, AnimatedCheckmark, AnimatedClock } from '../../components/common/AnimatedIcons';

export function HelpPage() {
  const { t, isTamil } = useLanguage();

  const faqsEn = [
    {
      q: 'How does the evidence-based deadline system work?',
      a: 'Unlike arbitrary targets, every resolution deadline must be tied to either a Citizen Charter statutory limit or an official department work memo entered by an authorized officer. If a deadline expires without completion, the system automatically flags it as Overdue and notifies supervisory authorities.',
    },
    {
      q: 'Can a Councillor close my complaint without my agreement?',
      a: 'No. When field repair work is completed, the ticket moves to "Resolution Proposed" with photographic evidence. The ticket is only marked officially "Resolved" after the citizen reporter inspects the location and confirms the fix. If the defect remains, the citizen can formally dispute and reopen the ticket.',
    },
    {
      q: 'Why am I restricted from commenting on a complaint from another ward?',
      a: 'Under municipal decentralization principles, civic accountability is anchored to local residents and their elected representatives. Anyone can view public issues statewide, but interactive participation (support, comments, ward chat) is reserved for verified residents of that ward.',
    },
    {
      q: 'What is a Confidential Accountability Report?',
      a: 'If a grievance is repeatedly ignored, missed deadlines are not justified, or an official falsely claims completion, citizens can file a confidential report. This is strictly isolated from public feeds and routed directly to independent reviewers. The reported councillor is barred from seeing the report or reporter identity.',
    },
    {
      q: 'What are the official escalation channels if ward response fails?',
      a: 'You can use the built-in escalation workflow to route the ticket to the Municipal Commissioner or District Collector. In addition, you can reference the Official Escalation Directory for direct state helplines such as CM Helpline 1100 or TANGEDCO Minnagam.',
    },
  ];

  const faqsTa = [
    {
      q: 'சான்றளிக்கப்பட்ட காலக்கெடு முறை எவ்வாறு செயல்படுகிறது?',
      a: 'தமிழ்நாடு குடிமக்கள் சாசன விதிகள் அல்லது துறை பணி உத்தரவின் அடிப்படையில் மட்டுமே தீர்வு நாள் நிர்ணயிக்கப்படுகிறது. காலக்கெடு முடிந்தும் வேலை முடியாத பட்சத்தில், கணினி தானாகவே அதை "காலக்கெடு கடந்தது" என எச்சரித்து உயர் அதிகாரிகளுக்குத் தகவல் அனுப்பும்.',
    },
    {
      q: 'புகாரளித்த என் அனுமதியின்றி கவுன்சிலர் புகாரை முடிக்க முடியுமா?',
      a: 'முடியாது. வேலை முடிந்ததும் அதிகாரிகள் புகைப்படத்துடன் "தீர்வு முன்மொழியப்பட்டது" என்றே மாற்ற முடியும். நீங்கள் நேரில் பார்த்து திருப்தியடைந்து "உறுதிசெய்கிறேன்" என்று அழுத்திய பின்னரே புகார் முழுமையாகத் தீர்க்கப்படும். குறை தீரவில்லையெனில் மறுப்புத் தெரிவிக்கலாம்.',
    },
    {
      q: 'வேறு வார்டு புகாரில் நான் கருத்துப் பதிவிட முடியாதது ஏன்?',
      a: 'வார்டு நிர்வாகத்தில் அந்தந்தப் பகுதி மக்களுக்கே முன்னுரிமை உண்டு. தமிழ்நாடு முழுவதும் உள்ள புகார்களை நீங்கள் பார்க்கலாம்; ஆனால் ஆதரவளிப்பது மற்றும் கருத்துப் பதிவிடுவது அந்த வார்டு மக்களுக்கான பிரத்யேக உரிமையாகும்.',
    },
    {
      q: 'ரகசிய பொறுப்புடைமை அறிக்கை என்றால் என்ன?',
      a: 'புகாரைத் தொடர்ந்து புறக்கணித்தாலோ அல்லது வேலை செய்யாமல் பொய் சொன்னாலோ, குடிமக்கள் ரகசியப் புகார் அளிக்கலாம். இது தனிப்பட்ட நடுநிலை அதிகாரிகளால் விசாரிக்கப்படும். குற்றம்சாட்டப்பட்ட கவுன்சிலர் இதை அணுகவோ உங்கள் பெயரைப் பார்க்கவோ முடியாது.',
    },
    {
      q: 'வார்டு அளவில் தீர்வு கிடைக்காத போது எங்கு முறையிடலாம்?',
      a: 'இத்தளத்தில் உள்ள "மேல்முறையீட்டு" வசதி மூலம் மாநகராட்சி ஆணையர் மற்றும் மாவட்ட ஆட்சியருக்கு அனுப்பலாம். மேலும் முதல்வர் உதவி எண் 1100, மின்வாரிய மின்னகம் ஆகியவற்றையும் அழைக்கலாம்.',
    },
  ];

  const faqs = isTamil ? faqsTa : faqsEn;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: t('navHelp') }]} />

      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-[#F97316]">
          <AnimatedShield className="w-6 h-6 text-[#F97316]" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {isTamil ? 'உள்ளாட்சி நிர்வாக வழிகாட்டி' : 'Platform Governance Guide'}
          </span>
        </div>
        <h1 className="text-xl sm:text-3xl font-black text-[#171717]">
          {isTamil
            ? 'அடிக்கடி கேட்கப்படும் கேள்விகள் & தமிழ்நாடு உள்ளாட்சி விதிகள்'
            : 'Frequently Asked Questions & Tamil Nadu Civic Bylaws'}
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
          {isTamil
            ? 'மக்கள் சரிபார்ப்பு, காலக்கெடு தணிக்கை மற்றும் ரகசிய பொறுப்புடைமை எவ்வாறு பொதுக் கட்டமைப்புகளைப் பாதுகாக்கின்றன என்பதை அறியுங்கள்.'
            : 'Learn how citizen verification, deadline auditing, and confidential accountability ensure real public infrastructure repairs.'}
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-6 shadow-2xs space-y-2">
            <h3 className="text-sm font-bold text-[#171717]">{faq.q}</h3>
            <p className="text-xs text-[#737373] leading-relaxed whitespace-pre-wrap">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
