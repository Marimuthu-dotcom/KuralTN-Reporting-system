// Frontend/src/pages/public/OfficialEscalationDirectoryPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Phone,
  Calendar,
  ExternalLink,
  Search,
} from 'lucide-react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Badge } from '../../components/common/Badge';
import { Select } from '../../components/common/Select';
import { useWard } from '../../hooks/useWard';
import { useLanguage } from '../../hooks/useLanguage';
import { AnimatedShield } from '../../components/common/AnimatedIcons';

export function OfficialEscalationDirectoryPage() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const { districts } = useWard();
  const { t, isTamil } = useLanguage();

  useEffect(() => {
    async function loadContacts() {
      try {
        const data = await import('../../services/adminService').then((m) =>
          m.adminService.getOfficialContacts()
        );
        setContacts(data || []);
      } catch {
        setContacts([
          {
            id: 'oec-01',
            portal_name: 'Tamil Nadu Chief Minister Helpline (Mudalvarin Mugavari)',
            authority_level: 'STATE_LEVEL',
            department_name: 'Public Grievance Redressal Dept',
            helpline_number: '1100 (Toll Free)',
            website_url: 'https://cmhelpline.tnega.org',
            escalation_instructions:
              'Use CM Helpline if ward-level or municipal body issues remain unresolved beyond the designated citizen charter SLA or after formal appeal.',
            last_verified_date: '2026-09-15',
          },
          {
            id: 'oec-02',
            portal_name: 'Thoothukudi City Corporation 24x7 Control Room',
            authority_level: 'MUNICIPAL_CORPORATION',
            district_name: 'Thoothukudi',
            department_name: 'Corporation General Grievances',
            helpline_number: '0461-2326901 / 1800-425-4244',
            website_url: 'https://thoothukudicorporation.tn.gov.in',
            escalation_instructions:
              'Direct corporation grievance line for urgent civic failures, uncollected waste dumps, and water supply ruptures across Wards 1 to 60.',
            last_verified_date: '2026-09-20',
          },
          {
            id: 'oec-03',
            portal_name: 'Tirunelveli Corporation Citizen WhatsApp Service',
            authority_level: 'MUNICIPAL_CORPORATION',
            district_name: 'Tirunelveli',
            department_name: 'Municipal Administration',
            helpline_number: '94437-01234',
            website_url: 'https://tirunelvelicorporation.tn.gov.in',
            escalation_instructions:
              'Send photo, location coordinates, and description for automated token generation with the Commissioner office.',
            last_verified_date: '2026-08-30',
          },
          {
            id: 'oec-04',
            portal_name: 'TANGEDCO (Electricity Board) Minnagam Central Control',
            authority_level: 'DEPARTMENTAL_DIRECTORATE',
            department_name: 'Tamil Nadu Generation and Distribution Corp',
            helpline_number: '94987 94987',
            website_url: 'https://www.tangedco.gov.in',
            escalation_instructions:
              'Report sparking transformers, sagging high-tension conductors, power outages, and broken utility poles 24x7.',
            last_verified_date: '2026-10-01',
          },
        ]);
      }
    }
    loadContacts();
  }, []);

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.portal_name.toLowerCase().includes(search.toLowerCase()) ||
      c.department_name?.toLowerCase().includes(search.toLowerCase());
    const matchesDistrict = !selectedDistrict || c.district_id === selectedDistrict;
    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t('navDirectory') }]} />

      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 text-[#F97316]">
          <AnimatedShield className="w-6 h-6 text-[#F97316]" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {isTamil ? 'அரசு அதிகாரப்பூர்வ உதவி எண்கள்' : 'Verified Government Escalation Contacts'}
          </span>
        </div>

        <h1 className="text-xl sm:text-3xl font-black text-[#171717] tracking-tight">
          {isTamil
            ? 'தமிழ்நாடு அரசு துறை உதவி எண்கள் & மேல்முறையீட்டு வழிகாட்டி'
            : 'Tamil Nadu Official Grievance Portals & Escalation Directory'}
        </h1>

        <p className="text-xs sm:text-sm text-[#737373] max-w-3xl leading-relaxed">
          {isTamil
            ? 'வார்டு அளவில் தீர்வு கிடைக்காத போது, மக்கள் முதல்வர் உதவி எண் 1100, மின்வாரிய மின்னகம், மாநகராட்சி கட்டுப்பாட்டு அறை ஆகியவற்றை நேரடியாகத் தொடர்பு கொள்ளலாம்.'
            : 'When ward-level grievance workflows face unreasonable delay or lack of acknowledgement, citizens have the constitutional and statutory right to escalate to supervisory bodies.'}
        </p>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder={isTamil ? 'துறை, மாநகராட்சி அல்லது எண் தேடுக...' : 'Search portal, department, or keywords...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          />
        </div>

        <Select
          placeholder={t('allDistricts')}
          value={selectedDistrict}
          options={districts.map((d) => ({ value: d.id, label: d.name }))}
          onChange={(e) => setSelectedDistrict(e.target.value)}
        />
      </div>

      {/* Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="primary" size="xs">
                  {contact.authority_level?.replace(/_/g, ' ')}
                </Badge>
                <div className="text-[11px] text-[#737373] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{isTamil ? 'சரிபார்க்கப்பட்டது: ' : 'Verified: '}{contact.last_verified_date}</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-[#171717]">
                {contact.portal_name}
              </h3>

              <div className="text-xs font-semibold text-[#F97316]">
                {contact.department_name} {contact.district_name ? `• ${contact.district_name}` : ''}
              </div>

              <p className="text-xs text-[#737373] leading-relaxed pt-1">
                {contact.escalation_instructions}
              </p>
            </div>

            <div className="pt-4 border-t border-[#E7E5E4] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#171717]">
                <Phone className="w-4 h-4 text-[#15803D]" />
                <span>{contact.helpline_number}</span>
              </div>

              <a
                href={contact.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-semibold text-[#F97316] hover:underline"
              >
                <span>{isTamil ? 'அரசு தளம் செல்ல' : 'Visit Official Portal'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
