// Backend/validators/complaintValidators.js
export function validateCreateComplaint(data) {
  const errors = [];
  if (!data.title || data.title.trim().length < 5) {
    errors.push({ field: 'title', message: 'Title must be at least 5 characters long' });
  }
  if (!data.description || data.description.trim().length < 15) {
    errors.push({ field: 'description', message: 'Description must be at least 15 characters long' });
  }
  if (!data.category_id) {
    errors.push({ field: 'category_id', message: 'Category is required' });
  }
  if (!data.ward_id) {
    errors.push({ field: 'ward_id', message: 'Ward is required' });
  }
  if (!data.address_text || data.address_text.trim().length < 5) {
    errors.push({ field: 'address_text', message: 'Address is required' });
  }
  return errors;
}

export function validateUpdateStatus(data) {
  const errors = [];
  const validStatuses = [
    'Submitted',
    'Acknowledged',
    'Under Review',
    'In Progress',
    'Resolution Proposed',
    'Resolved',
    'Closed',
    'Rejected',
  ];
  if (!data.status || !validStatuses.includes(data.status)) {
    errors.push({ field: 'status', message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }
  if (!data.reason || data.reason.trim().length < 5) {
    errors.push({ field: 'reason', message: 'A reason or official note is required for status updates' });
  }
  return errors;
}

export function validateResolutionProposal(data) {
  const errors = [];
  if (!data.description || data.description.trim().length < 15) {
    errors.push({ field: 'description', message: 'Resolution description must be at least 15 characters long' });
  }
  if (!data.completion_date) {
    errors.push({ field: 'completion_date', message: 'Completion date is mandatory' });
  }
  if (!data.source_of_resolution || data.source_of_resolution.trim().length < 5) {
    errors.push({ field: 'source_of_resolution', message: 'Source of resolution is mandatory (e.g. Field Inspection report, Contractor Job card)' });
  }
  return errors;
}
