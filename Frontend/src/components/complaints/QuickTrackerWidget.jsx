// Frontend/src/components/complaints/QuickTrackerWidget.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Building2,
  UserCheck,
  FileText,
} from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import { useLanguage } from '../../hooks/useLanguage';

export function QuickTrackerWidget() {
  const [refInput, setRefInput] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isTamil } = useLanguage();
  const navigate = useNavigate();

  const handleTrack = async (e, directRef) => {
    if (e) e.preventDefault();
    const query = (directRef || refInput).trim();
    if (!query) return;

    setIsLoading(true);
    setError(null);
    setComplaint(null);

    try {
      const res = await complaintService.getComplaints({ search: query, limit: 1 });
      const found = res.data?.find(
        (c) => c.reference_id?.toLowerCase() === query.toLowerCase() || c.id === query
      ) || res.data?.[0];

      if (!found) {
        setError(
          isTamil
            ? `புகார் எண் '${query}' கிடைக்கவில்லை. சரியான எண்ணைச் சரிபார்க்கவும்.`
            : `No grievance found with reference '${query}'. Please verify your ticket number.`
        );
      } else {
        setComplaint(found);
      }
    } catch (err) {
      console.error('Tracking query error:', err);
      setError(
        isTamil
          ? 'புகார் விவரத்தைத் தேட முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
          : 'Unable to look up grievance status. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sampleRefs = ['CIV-2026-00007', 'CIV-2026-00006', 'CIV-2026-00001'];

  return (
    <div className="bg-gradient-to-br from-white via-orange-50/30 to-amber-50/40 rounded-3xl border border-orange-200/80 p-5 sm:p-7 shadow-xs">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
            <Search className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight">
              {isTamil ? 'உடனடி புகார் நிலை கண்காணிப்பு' : 'Direct Civic Grievance Tracker'}
            </h3>
            <p className="text-xs text-neutral-500">
              {isTamil
                ? 'உங்கள் புகார் எண் (எ.கா: CIV-2026-00007) பதிவிட்டு கவுன்சிலர் மற்றும் துறை நிலையை அறியவும்'
                : 'Track the 4-stage accountability pipeline from Councillor verification to Department repair'}
            </p>
          </div>
        </div>

        {/* Input bar */}
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2 mt-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value.toUpperCase())}
              placeholder={isTamil ? 'புகார் குறிப்பு எண் (எ.கா: CIV-2026-00007)' : 'Enter Reference ID (e.g. CIV-2026-00007)'}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !refInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-black transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            {isLoading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>{isTamil ? 'நிலை காண்க' : 'Track Pipeline'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Sample click-to-fill chips */}
        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          <span className="text-[11px] font-medium text-neutral-400">
            {isTamil ? 'சோதனை எண்கள்:' : 'Try sample tickets:'}
          </span>
          {sampleRefs.map((ref) => (
            <button
              key={ref}
              type="button"
              onClick={() => {
                setRefInput(ref);
                handleTrack(null, ref);
              }}
              className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-700 hover:border-orange-400 hover:text-orange-600 transition-colors cursor-pointer"
            >
              {ref}
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Loaded Pipeline Result */}
        {complaint && (
          <div className="mt-5 bg-white rounded-2xl border border-orange-200 p-5 shadow-sm space-y-4 animate-fade-in">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    {complaint.reference_id}
                  </span>
                  <span className="text-xs font-bold text-neutral-900 truncate max-w-sm">
                    {complaint.title}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">
                  {complaint.ward_name || 'Ward 43'} • {complaint.address_text}
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/complaints/${complaint.id}`)}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <span>{isTamil ? 'முழு விவரம்' : 'Full Grievance Dossier'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4-Stage Civic Pipeline Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
              {/* Stage 1 */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px] uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1. {isTamil ? 'குடிமக்கள் புகார்' : 'Citizen Filed'}</span>
                </div>
                <div className="text-[11px] text-neutral-700 font-medium">
                  {complaint.is_anonymous ? 'Anonymous Citizen' : complaint.user_name || 'Citizen'}
                </div>
                <div className="text-[10px] text-neutral-500">
                  {new Date(complaint.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Stage 2: Councillor Middleware */}
              <div
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  complaint.councillor_verified
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/20'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider">
                  {complaint.councillor_verified ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-800">2. {isTamil ? 'கவுன்சிலர் சரிபார்த்தார்' : 'Councillor Verified'}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                      <span className="text-amber-800">2. {isTamil ? 'கவுன்சிலர் பரிசீலனை' : 'Pending Councillor'}</span>
                    </>
                  )}
                </div>
                <div className="text-[11px] font-medium text-neutral-800">
                  {complaint.councillor_verified
                    ? (complaint.councillor_name || 'Ward Councillor')
                    : 'Awaiting on-ground check'}
                </div>
                <div className="text-[10px] text-neutral-500">
                  {complaint.councillor_verified
                    ? `Verified & Dispatched: ${new Date(complaint.councillor_verified_at || complaint.updated_at).toLocaleDateString()}`
                    : 'Middleware Queue'}
                </div>
              </div>

              {/* Stage 3: Department Action */}
              <div
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  complaint.department_received && ['In Progress', 'Resolution Proposed', 'Resolved'].includes(complaint.status)
                    ? 'bg-blue-50 border-blue-200'
                    : complaint.department_received
                    ? 'bg-neutral-50 border-neutral-200'
                    : 'bg-neutral-50/50 border-neutral-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-blue-900">3. {isTamil ? 'துறை நடவடிக்கை' : 'Dept Action'}</span>
                </div>
                <div className="text-[11px] font-medium text-neutral-800 truncate">
                  {complaint.department_name || 'Engineering / Public Works'}
                </div>
                <div className="text-[10px] text-neutral-500">
                  {complaint.department_received
                    ? `Status: ${complaint.status}`
                    : 'Awaiting Councillor Release'}
                </div>
              </div>

              {/* Stage 4: Citizen Resolution Sign-off */}
              <div
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  complaint.status === 'Resolved' || complaint.verification_state === 'VERIFIED_RESOLVED'
                    ? 'bg-emerald-50 border-emerald-200'
                    : complaint.status === 'Resolution Proposed'
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-neutral-50/50 border-neutral-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider">
                  <UserCheck className="w-3.5 h-3.5 text-neutral-700" />
                  <span className="text-neutral-800">4. {isTamil ? 'மக்கள் ஏற்பு' : 'Citizen Sign-Off'}</span>
                </div>
                <div className="text-[11px] font-medium text-neutral-800">
                  {complaint.status === 'Resolved'
                    ? 'Citizen Confirmed'
                    : complaint.status === 'Resolution Proposed'
                    ? 'Inspection Pending'
                    : 'Incomplete'}
                </div>
                <div className="text-[10px] text-neutral-500">
                  {complaint.status === 'Resolved' ? 'Civic Resolution Complete' : 'Awaiting completion'}
                </div>
              </div>
            </div>

            {/* Councillor Verification Notes if available */}
            {complaint.councillor_notes && (
              <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200/70 text-xs">
                <span className="font-bold text-orange-950 flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                  <span>{isTamil ? 'வார்டு கவுன்சிலர் கள ஆய்வு குறிப்பு:' : 'Ward Councillor Field Inspection Findings:'}</span>
                </span>
                <p className="text-neutral-700 italic font-serif">"{complaint.councillor_notes}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
