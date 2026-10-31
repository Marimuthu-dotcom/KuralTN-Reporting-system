// Frontend/src/components/accountability/AccountabilityReportForm.jsx
import React, { useState } from 'react';
import { Lock, Shield, Upload, X, AlertTriangle } from 'lucide-react';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useWard } from '../../hooks/useWard';
import { ACCOUNTABILITY_CONCERN_TYPES } from '../../utils/constants';

export function AccountabilityReportForm({ onSubmit, isLoading = false }) {
  const { wards } = useWard();

  const [formData, setFormData] = useState({
    complaint_reference_id: '',
    reported_ward_id: '',
    concern_type: '',
    description: '',
    timeline_dates_text: '',
    follow_up_attempts_text: '',
    expected_action_and_outcome: '',
    is_anonymity_requested: true,
  });

  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (evidenceFiles.length + files.length > 5) {
      alert('You can upload up to 5 confidential evidence files.');
      return;
    }
    setEvidenceFiles([...evidenceFiles, ...files]);
  };

  const handleRemoveFile = (index) => {
    setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.reported_ward_id) {
      newErrors.reported_ward_id = 'Please select the ward where the handling concern occurred';
    }
    if (!formData.concern_type) {
      newErrors.concern_type = 'Please select the nature of administrative concern';
    }
    if (!formData.description.trim() || formData.description.trim().length < 20) {
      newErrors.description = 'Provide a factual, detailed statement of facts (min 20 chars)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        data.append(key, val);
      }
    });

    evidenceFiles.forEach((file) => {
      data.append('evidence', file);
    });

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Confidentiality Notice */}
      <div className="p-4 bg-neutral-900 text-white rounded-xl flex items-start gap-3 shadow-md">
        <Lock className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold block text-sm mb-1 text-[#F97316]">
            Strict Confidentiality & Whistleblower Protection
          </span>
          This report is routed directly to authorized <strong>Independent Accountability Reviewers</strong>.
          It is strictly barred from public feeds, ward chats, and cannot be accessed by the reported
          ward councillor.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Concern Category"
          required
          placeholder="Select concern type"
          value={formData.concern_type}
          options={ACCOUNTABILITY_CONCERN_TYPES}
          onChange={(e) => handleInputChange('concern_type', e.target.value)}
          error={errors.concern_type}
        />

        <Select
          label="Ward Concerned"
          required
          placeholder="Select ward"
          value={formData.reported_ward_id}
          options={wards.map((w) => ({
            value: w.id,
            label: `${w.ward_name} (Ward ${w.ward_number}) - ${w.district_name}`,
          }))}
          onChange={(e) => handleInputChange('reported_ward_id', e.target.value)}
          error={errors.reported_ward_id}
        />
      </div>

      <Input
        label="Related Complaint Reference ID (If applicable)"
        placeholder="e.g. CIV-2026-00045"
        value={formData.complaint_reference_id}
        onChange={(e) => handleInputChange('complaint_reference_id', e.target.value)}
        helperText="Leave empty if reporting general administrative inaction without a previous ticket."
      />

      <Textarea
        label="Detailed Statement of Facts"
        required
        rows={4}
        placeholder="Provide dates, locations, false claims made, or specific missed commitments..."
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        error={errors.description}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Timeline & Relevant Dates"
          placeholder="e.g. Reported Sept 15, closed falsely on Sept 20"
          value={formData.timeline_dates_text}
          onChange={(e) => handleInputChange('timeline_dates_text', e.target.value)}
        />

        <Input
          label="Follow-Up Attempts Made"
          placeholder="e.g. Called ward office twice, submitted 2 comments"
          value={formData.follow_up_attempts_text}
          onChange={(e) => handleInputChange('follow_up_attempts_text', e.target.value)}
        />
      </div>

      <Textarea
        label="Expected Corrective Action & Desired Outcome"
        rows={2}
        placeholder="e.g. Independent on-site verification and referral to Municipal Directorate"
        value={formData.expected_action_and_outcome}
        onChange={(e) => handleInputChange('expected_action_and_outcome', e.target.value)}
      />

      {/* Evidence Attachments */}
      <div>
        <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-2">
          Private Evidence Files (Screenshots, Photos, PDFs)
        </label>

        <div className="border-2 border-dashed border-[#E7E5E4] rounded-xl p-5 text-center hover:bg-neutral-50/50">
          <input
            type="file"
            id="accountability-file-input"
            accept="image/*,application/pdf"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <label htmlFor="accountability-file-input" className="cursor-pointer">
            <Upload className="mx-auto h-7 w-7 text-[#737373] mb-1.5" />
            <p className="text-sm font-semibold text-[#171717]">
              Upload confidential evidence documents
            </p>
            <p className="text-xs text-[#737373]">
              Files are encrypted and stored in private vault (Max 5 files)
            </p>
          </label>
        </div>

        {evidenceFiles.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-xs">
            {evidenceFiles.map((file, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between p-2 bg-neutral-100 rounded-lg text-[#171717]"
              >
                <span className="truncate max-w-xs">{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Anonymity Option */}
      <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-[#E7E5E4]">
        <input
          type="checkbox"
          id="anonymity-check"
          checked={formData.is_anonymity_requested}
          onChange={(e) => handleInputChange('is_anonymity_requested', e.target.checked)}
          className="rounded border-[#E7E5E4] text-[#F97316] focus:ring-[#F97316] w-4 h-4"
        />
        <label htmlFor="anonymity-check" className="text-xs text-[#171717] cursor-pointer">
          <strong>Request Anonymity:</strong> Withhold my name and identity from the reported ward
          officials during inquiry.
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" variant="secondary" size="lg" icon={Lock} isLoading={isLoading}>
          Submit Confidential Accountability Case
        </Button>
      </div>
    </form>
  );
}
