// Frontend/src/pages/citizen/CitizenDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { complaintService } from '../../services/complaintService';
import { communityService } from '../../services/communityService';
import { StatCard } from '../../components/dashboard/StatCard';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { ActivityList } from '../../components/dashboard/ActivityList';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  AnimatedAlert,
  AnimatedCheckmark,
  AnimatedMegaphone,
} from '../../components/common/AnimatedIcons';

export function CitizenDashboardPage() {
  const { user } = useAuth();
  const { t, isTamil } = useLanguage();
  const navigate = useNavigate();

  const [myComplaints, setMyComplaints] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [complaintsRes, annData] = await Promise.all([
          complaintService.getComplaints({ limit: 100 }),
          user?.ward_id ? communityService.getAnnouncements(user.ward_id) : Promise.resolve([]),
        ]);

        const all = complaintsRes.data || [];
        const userCreated = all.filter((c) => c.user_id === user?.id);
        setMyComplaints(userCreated);
        setAnnouncements(annData || []);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const resolvedCount = myComplaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const inProgressCount = myComplaints.filter((c) => c.status === 'In Progress' || c.status === 'Acknowledged' || c.status === 'Under Review').length;
  const awaitingVerification = myComplaints.filter((c) => c.status === 'Resolution Proposed');

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={`${t('welcomeBack')}, ${user?.full_name}`}
        subtitle={`${t('residentOf')} ${user?.ward_name || (user?.ward_id ? 'Ward ' + user.ward_id : 'Ward Pending')}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/complaints">
              <Button variant="outline" size="md" className="text-sm py-2.5 px-3.5 border-orange-200 text-[#EA580C] hover:bg-orange-50 font-bold">
                🏛️ {t('navPublicFeed')}
              </Button>
            </Link>
            <Link to="/report">
              <Button variant="primary" size="md" icon={PlusCircle} className="text-sm py-2.5 px-4 shadow-sm">
                {t('navReport')}
              </Button>
            </Link>
          </div>
        }
      />

      {/* Ward Residency Verification Pending Banner */}
      {user?.role === 'CITIZEN' && (!user?.is_ward_verified || user?.ward_verification_status === 'PENDING') && (
        <div className="p-4 sm:p-5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold block text-sm">
                {isTamil ? 'வார்டு குடியிருப்பு சரிபார்ப்பு நிலுவையில் உள்ளது' : 'Ward Residency Verification Pending'}
              </span>
              <p className="text-amber-800 leading-relaxed mt-0.5">
                {isTamil
                  ? 'உங்கள் முகவரி நகராட்சி நிர்வாகத்தால் சரிபார்க்கப்பட்டு வருகிறது. சரிபார்ப்பு முடிந்ததும் உங்கள் வார்டு சமூக அரங்கம் முழுமையாக திறக்கப்படும்.'
                  : 'Your territorial residency is under review by the municipal administration. Once verified, full ward voting and private community chat will be active.'}
              </p>
            </div>
          </div>
          <Link to="/verification-pending">
            <Button variant="outline" size="sm" className="border-amber-300 text-amber-900 hover:bg-amber-100 whitespace-nowrap">
              {isTamil ? 'நிலையைக் காண்க' : 'View Status'}
            </Button>
          </Link>
        </div>
      )}

      {/* Awaiting Citizen Verification Alert Banner */}
      {awaitingVerification.length > 0 && (
        <div className="p-4 sm:p-5 bg-amber-500 text-white rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AnimatedAlert className="w-7 h-7 text-white shrink-0" />
            <div className="text-xs">
              <span className="font-bold block text-sm sm:text-base">
                {t('actionRequiredBanner')}
              </span>
              <p className="opacity-95 leading-relaxed mt-0.5">
                {t('actionRequiredDesc')}
              </p>
            </div>
          </div>
          <Link to={`/complaints/${awaitingVerification[0].id}`}>
            <Button variant="secondary" size="sm" className="bg-neutral-900 text-white hover:bg-neutral-800 whitespace-nowrap">
              {t('reviewEvidenceBtn')}
            </Button>
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('myReports')}
          value={myComplaints.length}
          subtitle={isTamil ? 'நீங்கள் பதிவு செய்தவை' : 'Total tickets filed by you'}
          icon={FileText}
          variant="default"
          onClick={() => navigate('/my-complaints')}
        />
        <StatCard
          title={t('activeIssues')}
          value={inProgressCount}
          subtitle={isTamil ? 'ஆய்வில் அல்லது பணி நடப்பில்' : 'Under review or in progress'}
          icon={Clock}
          variant="primary"
          onClick={() => navigate('/my-complaints')}
        />
        <StatCard
          title={t('resolvedIssues')}
          value={resolvedCount}
          subtitle={isTamil ? 'மக்கள் உறுதிசெய்தவை' : 'Citizen-verified completions'}
          icon={CheckCircle2}
          variant="success"
          onClick={() => navigate('/my-complaints')}
        />
        <StatCard
          title={t('awaitingReview')}
          value={awaitingVerification.length}
          subtitle={isTamil ? 'உங்கள் ஒப்புதலுக்கு' : 'Resolutions pending your test'}
          icon={AlertTriangle}
          variant={awaitingVerification.length > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Two columns: Announcements & Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Ward Announcements (1 col) */}
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#171717] uppercase tracking-wider">
              <AnimatedMegaphone className="w-4 h-4 text-[#F97316]" />
              <span>{t('recentWardAnnouncements')}</span>
            </div>
            <Link
              to="/ward/announcements"
              className="text-xs text-[#F97316] font-semibold hover:underline"
            >
              {t('viewAll')}
            </Link>
          </div>

          {announcements.length === 0 ? (
            <p className="text-xs text-[#737373] text-center py-6">
              {isTamil
                ? 'உங்கள் வார்டு கவுன்சிலர் அறிவிப்புகள் எதுவும் வெளியிடவில்லை.'
                : 'No recent announcements published by your Ward Councillor.'}
            </p>
          ) : (
            <div className="space-y-3">
              {announcements.slice(0, 3).map((a) => (
                <div key={a.id} className="p-3 bg-neutral-50 rounded-xl border border-[#E7E5E4] text-xs space-y-1">
                  <div className="font-bold text-[#171717]">{a.title}</div>
                  <p className="text-[#737373] line-clamp-2 leading-relaxed">{a.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Recent Grievances (2 cols) */}
        <div className="lg:col-span-2">
          <ActivityList
            items={myComplaints.slice(0, 5)}
            title={isTamil ? 'என் சமீபத்திய புகார்கள்' : 'My Recent Grievances'}
          />
        </div>
      </div>
    </div>
  );
}
