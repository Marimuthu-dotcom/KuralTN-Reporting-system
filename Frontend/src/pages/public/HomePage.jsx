// Frontend/src/pages/public/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Building,
  ArrowRight,
} from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { useWard } from '../../hooks/useWard';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { Button } from '../../components/common/Button';
import {
  AnimatedShield,
  AnimatedCheckmark,
  AnimatedClock,
  AnimatedCamera,
  AnimatedPin,
} from '../../components/common/AnimatedIcons';
import { QuickTrackerWidget } from '../../components/complaints/QuickTrackerWidget';

export function HomePage() {
  const [featuredComplaints, setFeaturedComplaints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { categories } = useWard();
  const { isAuthenticated } = useAuth();
  const { t, getCategoryTitle, isTamil } = useLanguage();
  const navigate = useNavigate();


  useEffect(() => {
    let isMounted = true;
    async function fetchFeatured() {
      try {
        const res = await complaintService.getComplaints({ limit: 4, sortBy: 'most_supported' });
        if (isMounted) {
          setFeaturedComplaints(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load featured grievances:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    fetchFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/complaints?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/complaints');
    }
  };

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Hero Section */}
      <section className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-12 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-[#F97316] text-xs font-bold uppercase tracking-wider">
            <AnimatedShield className="w-4 h-4 text-[#F97316]" />
            <span>{t('heroTag')}</span>
          </div>

          <h1 className="text-2xl sm:text-5xl font-black text-[#171717] tracking-tight leading-tight">
            {t('heroTitle')}
          </h1>

          <p className="text-xs sm:text-base text-[#737373] leading-relaxed">
            {t('heroDesc')}
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder={t('heroSearchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm bg-neutral-50 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              {t('searchBtn')}
            </Button>
          </form>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link to="/report">
              <Button variant="primary" size="lg" icon={PlusCircle} className="w-full sm:w-auto text-sm sm:text-base py-3">
                {t('reportProblemBtn')}
              </Button>
            </Link>

            <Link to="/complaints">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm sm:text-base py-3">
                {t('browseFeedBtn')}
              </Button>
            </Link>

            <Link to="/departments">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm sm:text-base py-3">
                🏛️ {isTamil ? 'அரசுத் துறைகள்' : 'Civic Departments'}
              </Button>
            </Link>

            <Link to="/escalation-directory">
              <Button variant="ghost" size="lg" className="text-xs sm:text-sm">
                {t('officialDirectoryBtn')} &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Direct Civic Grievance Tracker */}
      <QuickTrackerWidget />

      {/* Mobile Friendly 3-Step Visual Guide */}
      <section className="bg-orange-50/70 border border-orange-200/80 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F97316]">
            {isTamil ? 'எளிய மக்கள் பயன்பாடு' : 'Made Easy for Everyday Citizens'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717]">
            {t('howItWorksTitle')}
          </h2>
          <p className="text-xs text-[#737373]">
            {isTamil
              ? 'ஸ்மார்ட்போன் பயன்படுத்தத் தெரிந்தாலே போதும், எவரும் எளிதாகப் புகாரளிக்கலாம்!'
              : 'Designed so anyone with a mobile phone can report and track issues effortlessly.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-xs flex flex-col items-center text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mb-1">
              <AnimatedCamera className="w-8 h-8 text-[#F97316]" />
            </div>
            <h3 className="text-sm font-bold text-[#171717]">{t('step1Title')}</h3>
            <p className="text-xs text-[#737373] leading-relaxed">{t('step1Desc')}</p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-xs flex flex-col items-center text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-1">
              <AnimatedPin className="w-8 h-8 text-[#B45309]" />
            </div>
            <h3 className="text-sm font-bold text-[#171717]">{t('step2Title')}</h3>
            <p className="text-xs text-[#737373] leading-relaxed">{t('step2Desc')}</p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-xs flex flex-col items-center text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-1">
              <AnimatedCheckmark className="w-8 h-8 text-[#15803D]" />
            </div>
            <h3 className="text-sm font-bold text-[#171717]">{t('step3Title')}</h3>
            <p className="text-xs text-[#737373] leading-relaxed">{t('step3Desc')}</p>
          </div>
        </div>
      </section>

      {/* Verified Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 space-y-2">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
            <AnimatedClock className="w-6 h-6 text-[#F97316]" />
          </div>
          <h3 className="text-base font-bold text-[#171717]">
            {isTamil ? 'உறுதியான காலக்கெடு' : 'Evidence-Based Deadlines'}
          </h3>
          <p className="text-xs text-[#737373] leading-relaxed">
            {isTamil
              ? 'ஒவ்வொரு புகார் தீர்வும் தமிழ்நாடு குடிமக்கள் சாசன விதிகளின்படி அரசு நிர்ணயித்த காலக்கெடுவுடன் கண்காணிக்கப்படும்.'
              : 'Every resolution date must cite an official departmental commitment or Citizen Charter standard. Overdue delays trigger automated alerts.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 space-y-2">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-3">
            <AnimatedCheckmark className="w-6 h-6 text-[#15803D]" />
          </div>
          <h3 className="text-base font-bold text-[#171717]">
            {isTamil ? 'மக்கள் சரிபார்த்தல்' : 'Citizen-Verified Completion'}
          </h3>
          <p className="text-xs text-[#737373] leading-relaxed">
            {isTamil
              ? 'அதிகாரிகள் தன்னிச்சையாகப் புகாரை முடிக்க முடியாது. நீங்கள் நேரில் பார்த்து ஒப்புதல் அளித்த பின்னரே தீர்வு உறுதிசெய்யப்படும்.'
              : 'A ticket cannot simply be closed by an official. The citizen reporter inspects the site and confirms or formally disputes the repair.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 space-y-2">
          <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-3">
            <AnimatedShield className="w-6 h-6 text-[#F97316]" />
          </div>
          <h3 className="text-base font-bold text-[#171717]">
            {isTamil ? 'ரகசிய பொறுப்புடைமை' : 'Confidential Accountability'}
          </h3>
          <p className="text-xs text-[#737373] leading-relaxed">
            {isTamil
              ? 'வேலை செய்யாமல் பொய் சொன்னாலோ, தொடர்ந்து புறக்கணித்தாலோ தனிப்பட்ட நடுநிலை அதிகாரிகளிடம் ரகசியப் புகார் அளிக்கலாம்.'
              : 'Isolated reporting route for repeated inaction or false closures, audited by independent reviewers with full conflict-of-interest safeguards.'}
          </p>
        </div>
      </section>

      {/* Categories Showcase with Tamil Translations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#171717]">
              {isTamil ? 'புகார் வகைகள் & துறைகள்' : 'Civic Issue Categories'}
            </h2>
            <p className="text-xs text-[#737373]">
              {isTamil
                ? 'தமிழ்நாடு உள்ளாட்சி விதிமுறைகளின்படி வரையறுக்கப்பட்ட பிரிவுகள்'
                : 'Standardized classifications under Tamil Nadu municipal bylaws'}
            </p>
          </div>
          <Link to="/complaints" className="text-xs font-semibold text-[#F97316] hover:underline">
            {t('viewAll')}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.slice(0, 10).map((cat) => {
            const catTitle = getCategoryTitle(cat.id, cat.name);
            return (
              <Link
                key={cat.id}
                to={`/complaints?category_id=${cat.id}`}
                className="bg-white rounded-2xl border border-[#E7E5E4] p-4 text-center hover:border-[#F97316] hover:shadow-sm transition-all group"
              >
                <div className="font-bold text-xs text-[#171717] group-hover:text-[#F97316] line-clamp-1">
                  {catTitle}
                </div>
                <div className="text-[10px] text-[#737373] mt-1">
                  SLA: ~{cat.estimated_sla_days} {isTamil ? 'நாட்கள்' : 'days'}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Grievances Feed */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#171717]">
              {isTamil ? 'வார்டு புகார்கள் நேரலை நிலை' : 'Community Issues Under Resolution'}
            </h2>
            <p className="text-xs text-[#737373]">
              {isTamil
                ? 'தூத்துக்குடி, திருநெல்வேலி, தென்காசி வார்டு புகார்கள்'
                : 'Active civic reports in Thoothukudi, Tirunelveli, and Tenkasi'}
            </p>
          </div>
          <Link
            to="/complaints"
            className="text-xs font-semibold text-[#F97316] hover:underline flex items-center gap-1"
          >
            <span>{t('viewAll')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {featuredComplaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
