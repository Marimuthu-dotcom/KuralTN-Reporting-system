// Frontend/src/components/navigation/DemoRoleBar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronDown, ChevronUp, UserCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useLanguage } from '../../hooks/useLanguage';
import { DEMO_ACCOUNTS } from '../../utils/constants';

export function DemoRoleBar() {
  const { user, loginWithGoogle } = useAuth();
  const { showSuccess, showError } = useToast();
  const { isTamil } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const navigate = useNavigate();

  const handleSwitch = async (acc) => {
    if (user?.id === acc.id) return;
    setIsSwitching(true);
    try {
      const res = await loginWithGoogle(null, acc.id || acc.userId);
      showSuccess(
        isTamil
          ? `${acc.name} கணக்கிற்கு மாற்றப்பட்டது`
          : `Switched persona to ${acc.name} (${acc.role.replace(/_/g, ' ')})`
      );

      if (res?.redirectTo) {
        navigate(res.redirectTo);
      } else if (acc.role === 'WARD_COUNCILLOR') {
        navigate('/councillor');
      } else if (acc.role === 'ADMIN') {
        navigate('/admin');
      } else if (acc.role === 'DEPARTMENT_HANDLER') {
        navigate('/councillor/assignments');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Role switch error:', err);
      showError('Failed to switch persona');
    } finally {
      setIsSwitching(false);
    }
  };

  const currentAccount = DEMO_ACCOUNTS.find((a) => a.id === user?.id) || {
    name: user?.full_name || 'Guest Citizen',
    role: user?.role || 'CITIZEN',
    desc: 'Public Viewer',
  };

  return (
    <div className="bg-neutral-900 text-neutral-200 border-b border-neutral-800 text-xs select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2">
        {/* Left: Active Persona indicator */}
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-neutral-400 font-medium shrink-0 hidden sm:inline">
            {isTamil ? 'செயலில் உள்ள பாத்திரம்:' : 'Active Persona:'}
          </span>
          <span className="font-bold text-white truncate max-w-[200px] sm:max-w-none flex items-center gap-1.5">
            {currentAccount.name}
            <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-orange-400 text-[10px] font-mono tracking-wide uppercase">
              {currentAccount.role.replace(/_/g, ' ')}
            </span>
          </span>
        </div>

        {/* Center: Middleware accountability badge */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-neutral-400 bg-neutral-800/80 px-2.5 py-0.5 rounded-full border border-neutral-700/50">
          <Shield className="w-3.5 h-3.5 text-orange-400" />
          <span>
            {isTamil
              ? 'வார்டு கவுன்சிலர் சரிபார்ப்பு & ஒப்புதல் நடைமுறை அமலில் உள்ளது'
              : 'Ward Councillor Middleware Workflow Active: Citizen ➔ Councillor ➔ Department'}
          </span>
        </div>

        {/* Right: Quick buttons & toggle */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1">
            {DEMO_ACCOUNTS.map((acc) => {
              const isActive = user?.id === acc.id;
              let roleShort = 'Citizen';
              if (acc.role === 'WARD_COUNCILLOR') roleShort = 'Councillor';
              if (acc.role === 'DEPARTMENT_HANDLER') roleShort = 'Engineer';
              if (acc.role === 'ADMIN') roleShort = 'Admin';

              return (
                <button
                  key={acc.id}
                  type="button"
                  disabled={isSwitching}
                  onClick={() => handleSwitch(acc)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                  title={`${acc.name} - ${acc.desc}`}
                >
                  {isActive && <CheckCircle2 className="w-3 h-3 text-white" />}
                  <span>{roleShort}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            title="Toggle Persona Details"
          >
            <span className="text-[10px] sm:hidden font-semibold text-orange-400">Switch</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable persona selection drawer */}
      {isExpanded && (
        <div className="border-t border-neutral-800 bg-neutral-950/90 px-3 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="text-[11px] font-semibold text-neutral-400 mb-2">
              {isTamil
                ? 'முழு அமைப்பையும் சோதிக்க விரும்பிய பாத்திரத்தைத் தேர்ந்தெடுக்கவும்:'
                : 'Select a persona to test the complete civic governance lifecycle:'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const isActive = user?.id === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    disabled={isSwitching}
                    onClick={() => {
                      handleSwitch(acc);
                      setIsExpanded(false);
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      isActive
                        ? 'border-orange-500/80 bg-orange-950/20 text-white'
                        : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80 hover:border-neutral-700 text-neutral-300'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                      {acc.picture ? (
                        <img src={acc.picture} alt={acc.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-orange-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span className="truncate">{acc.name}</span>
                        {isActive && <span className="text-[10px] text-orange-400 font-bold">Active</span>}
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate mt-0.5">{acc.desc}</div>
                      <div className="text-[9px] text-neutral-500 mt-1 flex items-center gap-1 font-mono">
                        <span>{acc.role}</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
