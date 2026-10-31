// Frontend/src/components/complaints/ProgressUpdateForm.jsx
import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';

export function ProgressUpdateForm({ complaintId, onSubmit, isLoading = false }) {
  const [formData, setFormData] = useState({
    update_title: '',
    update_body: '',
    department_source: '',
    reference_no: '',
    progress_percentage: 50,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.update_title || !formData.update_body) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Update Title"
        required
        placeholder="e.g. Sanitary crew mobilized for de-silting"
        value={formData.update_title}
        onChange={(e) => setFormData({ ...formData, update_title: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Department Source"
          placeholder="e.g. Health & Sanitation Dept"
          value={formData.department_source}
          onChange={(e) => setFormData({ ...formData, department_source: e.target.value })}
        />
        <Input
          label="Work Order / Memo Ref No"
          placeholder="e.g. WO-2026-8812"
          value={formData.reference_no}
          onChange={(e) => setFormData({ ...formData, reference_no: e.target.value })}
        />
      </div>

      <Textarea
        label="Progress Details"
        required
        rows={3}
        placeholder="Describe actions taken, machinery deployed, and current status..."
        value={formData.update_body}
        onChange={(e) => setFormData({ ...formData, update_body: e.target.value })}
      />

      <div>
        <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
          Estimated Progress: {formData.progress_percentage}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={formData.progress_percentage}
          onChange={(e) =>
            setFormData({ ...formData, progress_percentage: parseInt(e.target.value, 10) })
          }
          className="w-full accent-[#F97316] cursor-pointer"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
          Publish Progress Bulletin
        </Button>
      </div>
    </form>
  );
}
