// Frontend/src/pages/admin/OfficialContactsPage.jsx
import React, { useState } from 'react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { ShieldAlert, PlusCircle, Phone } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

const LOCAL_OFFICIAL_CONTACTS = [
  {
    id: 'oc-1',
    portal_name: 'Tamil Nadu Chief Minister Helpline (Mudalvarin Mugavari)',
    authority_level: 'STATE_LEVEL',
    helpline_number: '1100 (Toll Free)',
    website_url: 'https://cmhelpline.tnega.org',
    escalation_instructions: 'Use CM Helpline if municipal complaints breach statutory SLA timelines.',
  },
  {
    id: 'oc-2',
    portal_name: 'Greater Chennai Corporation 24x7 Control Room',
    authority_level: 'MUNICIPAL_CORPORATION',
    helpline_number: '1913 / 044-25619206',
    website_url: 'https://chennaicorporation.gov.in',
    escalation_instructions: 'Cite CIV complaint reference ID for road, drain, and streetlighting delays.',
  },
  {
    id: 'oc-3',
    portal_name: 'TANGEDCO Minnagam Consumer Cell',
    authority_level: 'DEPARTMENTAL_DIRECTORATE',
    helpline_number: '94987 94987',
    website_url: 'https://www.tangedco.gov.in',
    escalation_instructions: 'Emergency electricity fault, damaged poles, and transformer maintenance.',
  },
];

export function OfficialContactsPage() {
  const [contacts, setContacts] = useState(LOCAL_OFFICIAL_CONTACTS);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    portal_name: '',
    authority_level: 'MUNICIPAL_CORPORATION',
    helpline_number: '',
    website_url: '',
    escalation_instructions: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const localContact = { id: `oc-local-${Date.now()}`, ...formData };
    setContacts((prev) => [localContact, ...prev]);
    setFormData({
      portal_name: '',
      authority_level: 'MUNICIPAL_CORPORATION',
      helpline_number: '',
      website_url: '',
      escalation_instructions: '',
    });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'Official Contacts' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#171717]">Escalation Directory Management</h1>
          <p className="text-xs text-[#737373] mt-1">
            Maintain verified government complaint hotlines, control rooms, and state helplines
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={PlusCircle}
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? 'Cancel' : 'Add Official Hotline'}
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
          <Input
            label="Portal / Department Title"
            required
            placeholder="e.g. Madurai Corporation 24x7 Control Room"
            value={formData.portal_name}
            onChange={(e) => setFormData({ ...formData, portal_name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Helpline Number"
              required
              placeholder="e.g. 0452-2530501"
              value={formData.helpline_number}
              onChange={(e) => setFormData({ ...formData, helpline_number: e.target.value })}
            />
            <Input
              label="Official Website URL"
              required
              placeholder="https://..."
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
            />
          </div>

          <Textarea
            label="Escalation Instructions"
            required
            rows={2}
            placeholder="When to contact and what reference to cite..."
            value={formData.escalation_instructions}
            onChange={(e) => setFormData({ ...formData, escalation_instructions: e.target.value })}
          />

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="sm">
              Save Contact
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {contacts.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="primary" size="xs">{c.authority_level?.replace(/_/g, ' ')}</Badge>
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#171717]">
                <Phone className="w-3.5 h-3.5 text-[#15803D]" />
                <span>{c.helpline_number}</span>
              </div>
            </div>
            <h3 className="text-sm font-bold text-[#171717]">{c.portal_name}</h3>
            <p className="text-xs text-[#737373]">{c.escalation_instructions}</p>
          </div>
        ))}
      </div>
    </div>
  );
}