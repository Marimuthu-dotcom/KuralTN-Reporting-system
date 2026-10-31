// Frontend/src/components/complaints/ResolutionEvidenceForm.jsx
import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function ResolutionEvidenceForm({ complaintId, onSubmit, isLoading = false }) {
  const [formData, setFormData] = useState({
    description: '',
    completion_date: new Date().toISOString().split('T')[0],
    source_of_resolution: '',
    evidence_image_url: '',
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.description.trim() || formData.description.trim().length < 15) {
      newErrors.description = 'Please describe the completion work thoroughly (min 15 chars)';
    }
    if (!formData.completion_date) {
      newErrors.completion_date = 'Completion date is mandatory';
    }
    if (!formData.source_of_resolution.trim()) {
      newErrors.source_of_resolution = 'Source of resolution is mandatory (e.g. Field Inspection Report)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-[#15803D] flex items-start gap-2">
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Proposing a resolution moves the status to <strong>Resolution Proposed</strong>.
          The citizen who reported the problem will be notified to physically inspect and confirm
          or dispute the resolution before it is marked final.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Completion Date"
          type="date"
          required
          value={formData.completion_date}
          onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
          error={errors.completion_date}
        />

        <Input
          label="Source of Resolution Information"
          required
          placeholder="e.g. Field Inspection by Asst. Executive Engineer"
          value={formData.source_of_resolution}
          onChange={(e) => setFormData({ ...formData, source_of_resolution: e.target.value })}
          error={errors.source_of_resolution}
          helperText="Identify the official inspection log or contractor job card."
        />
      </div>

      <Textarea
        label="Description of Resolution Work Completed"
        required
        rows={3}
        placeholder="Detail what repairs were carried out, materials replaced, or cleaning accomplished..."
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        error={errors.description}
      />

      <Input
        label="Evidence Photograph URL"
        placeholder="https://... (or image link showing completed repair)"
        value={formData.evidence_image_url}
        onChange={(e) => setFormData({ ...formData, evidence_image_url: e.target.value })}
        helperText="Photograph showing clear before-and-after resolution."
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="success" size="md" isLoading={isLoading}>
          Propose Resolution for Citizen Verification
        </Button>
      </div>
    </form>
  );
}
