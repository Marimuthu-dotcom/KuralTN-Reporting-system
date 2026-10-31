// Frontend/src/components/complaints/CouncillorDocketModal.jsx
import React from 'react';
import {
  Printer,
  ShieldCheck,
  Building,
  CheckCircle,
  MapPin,
  Calendar,
  X,
  FileText,
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export function CouncillorDocketModal({ complaint, isOpen, onClose }) {
  if (!isOpen || !complaint) return null;
  const { isTamil } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  const verifiedDate = complaint.councillor_verified_at
    ? new Date(complaint.councillor_verified_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden print:shadow-none print:border-none print:max-w-none print:rounded-none">
        {/* Top action bar - hidden on print */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-sm">
              {isTamil ? 'வார்டு கவுன்சிலர் கள ஆய்வு & சான்றளிப்பு ஆவணம்' : 'Ward Councillor Official Verification Docket'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isTamil ? 'அச்சிடுக' : 'Print Docket'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Docket Sheet Printable Body */}
        <div className="p-6 sm:p-10 space-y-6 text-[#171717] bg-[#FAF9F6] print:bg-white print:p-8">
          {/* Official Emblem & Header */}
          <div className="text-center border-b-2 border-neutral-800 pb-5 space-y-1">
            <div className="text-xs font-black uppercase tracking-widest text-[#B45309]">
              GOVERNMENT OF TAMIL NADU • LOCAL CIVIC GOVERNANCE
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 uppercase tracking-tight">
              {complaint.local_body_name || 'THOOTHUKUDI CITY MUNICIPAL CORPORATION'}
            </h1>
            <div className="text-xs font-bold text-neutral-600">
              OFFICE OF THE ELECTED WARD COUNCILLOR • {complaint.ward_name || 'WARD 43'}
            </div>
            <div className="inline-block mt-2 px-3 py-1 rounded-full bg-orange-100 text-[#B45309] text-[11px] font-mono font-bold tracking-wider">
              CIVIC DISPATCH & VERIFICATION REQUISITION DOCKET
            </div>
          </div>

          {/* Reference & Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white rounded-2xl border border-neutral-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Ticket Ref ID</span>
              <span className="font-mono font-black text-orange-600 text-sm">{complaint.reference_id}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Filing Date</span>
              <span className="font-medium text-neutral-800">{new Date(complaint.created_at).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Verification Date</span>
              <span className="font-medium text-neutral-800">{verifiedDate}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Assigned Dept</span>
              <span className="font-bold text-neutral-900 truncate block">{complaint.department_name || 'Engineering Works'}</span>
            </div>
          </div>

          {/* Citizen Grievance Brief */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-2">
              <FileText className="w-4 h-4 text-neutral-500" />
              <span>Reported Grievance Summary</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-neutral-900">{complaint.title}</h3>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{complaint.description}</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-500 pt-1">
              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span>{complaint.address_text}</span>
            </div>
          </div>

          {/* Councillor Verification Accountability Section */}
          <div className="bg-orange-50/80 rounded-2xl border-2 border-orange-300 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-orange-200 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-600" />
                <span className="text-xs font-black uppercase tracking-wider text-orange-950">
                  Ward Councillor Field Inspection Endorsement
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-200 text-orange-900 uppercase">
                VERIFIED & DISPATCHED
              </span>
            </div>

            <div className="text-xs text-neutral-800 space-y-2">
              <div className="font-semibold text-neutral-900">
                Elected Councillor: <span className="font-bold">{complaint.councillor_name || 'Councillor M. Senthil Nathan (Ward 43)'}</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-orange-200 text-xs italic font-serif leading-relaxed text-neutral-900">
                "{complaint.councillor_notes || 'Field inspection conducted on-site. The civic hazard was verified as genuine and requires departmental equipment and staff.'}"
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-neutral-600 pt-2 border-t border-orange-200/80 gap-1 font-mono">
              <span>Department Received: {complaint.department_received ? 'YES (Acknowledged)' : 'PENDING'}</span>
              <span>Priority Rating: HIGH URGENCY</span>
            </div>
          </div>

          {/* Signatures & Certification Seals */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-neutral-300 text-center text-xs">
            <div className="space-y-4">
              <div className="font-mono text-[10px] text-neutral-400">DIGITALLY ENDORSED BY</div>
              <div className="inline-block px-4 py-2 border-2 border-dashed border-neutral-400 rounded-xl font-serif text-sm font-bold text-neutral-800">
                {complaint.councillor_name || 'M. Senthil Nathan'}
                <div className="text-[9px] font-sans font-normal text-neutral-500">Ward Councillor seal verified</div>
              </div>
              <div className="text-[10px] text-neutral-500">Signature of Ward Councillor</div>
            </div>

            <div className="space-y-4">
              <div className="font-mono text-[10px] text-neutral-400">DEPARTMENT RECEIPT</div>
              <div className="inline-block px-4 py-2 border-2 border-dashed border-neutral-400 rounded-xl font-serif text-sm font-bold text-neutral-800">
                {complaint.department_name || 'Engineering / Drainage'}
                <div className="text-[9px] font-sans font-normal text-neutral-500">Work order queued</div>
              </div>
              <div className="text-[10px] text-neutral-500">Department Dispatch Seal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
