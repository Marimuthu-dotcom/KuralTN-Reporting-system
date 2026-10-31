// Frontend/src/pages/citizen/SettingsPage.jsx
import React, { useState } from 'react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Button } from '../../components/common/Button';
import { Bell, Shield, Moon } from 'lucide-react';

export function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(true);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Breadcrumbs items={[{ label: 'Settings' }]} />

      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-8 shadow-xs space-y-6">
        <h1 className="text-xl font-bold text-[#171717]">Account & Preference Settings</h1>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-[#E7E5E4]">
            <div className="space-y-0.5">
              <span className="font-bold text-[#171717] block">Email Alerts on Status Changes</span>
              <span className="text-[#737373]">
                Receive notification when councillor updates complaint or proposes resolution.
              </span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="accent-[#F97316] w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-[#E7E5E4]">
            <div className="space-y-0.5">
              <span className="font-bold text-[#171717] block">Browser Real-time Sound Alerts</span>
              <span className="text-[#737373]">
                Play subtle chime when live ward announcement or ticket message arrives.
              </span>
            </div>
            <input
              type="checkbox"
              checked={browserNotifications}
              onChange={(e) => setBrowserNotifications(e.target.checked)}
              className="accent-[#F97316] w-4 h-4 cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#E7E5E4] flex justify-end">
          <Button variant="primary" size="sm" onClick={() => alert('Preferences saved!')}>
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
