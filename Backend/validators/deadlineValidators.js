// Backend/validators/deadlineValidators.js
export function validateDeadlineProposal(data) {
  const errors = [];
  if (!data.target_date) {
    errors.push({ field: 'target_date', message: 'Target resolution date is required' });
  }
  const validTypes = [
    'VERIFIED_OFFICIAL_TIMELINE',
    'DEPARTMENT_PROVIDED_TARGET',
    'ADMINISTRATOR_CONFIGURED_TARGET',
    'ESTIMATED_TARGET',
    'DEADLINE_NOT_CONFIRMED',
  ];
  if (!data.deadline_type || !validTypes.includes(data.deadline_type)) {
    errors.push({ field: 'deadline_type', message: `Deadline type must be one of: ${validTypes.join(', ')}` });
  }
  if (!data.supporting_source_text || data.supporting_source_text.trim().length < 5) {
    errors.push({ field: 'supporting_source_text', message: 'Supporting source or department reference is mandatory' });
  }
  return errors;
}

export function validateDeadlineExtension(data) {
  const errors = [];
  if (!data.new_target_date) {
    errors.push({ field: 'new_target_date', message: 'Proposed new target date is required' });
  }
  if (!data.reason || data.reason.trim().length < 10) {
    errors.push({ field: 'reason', message: 'Comprehensive explanation for extension delay is mandatory' });
  }
  return errors;
}
