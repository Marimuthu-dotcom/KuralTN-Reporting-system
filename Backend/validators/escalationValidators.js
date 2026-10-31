// Backend/validators/escalationValidators.js
export function validateEscalation(data) {
  const errors = [];
  const validCategories = [
    'NO_ACKNOWLEDGEMENT',
    'OVERDUE_DEADLINE',
    'INADEQUATE_PROGRESS',
    'DISPUTED_RESOLUTION',
    'REPEATED_DELAY',
  ];
  if (!data.reason_category || !validCategories.includes(data.reason_category)) {
    errors.push({ field: 'reason_category', message: `Reason category must be one of: ${validCategories.join(', ')}` });
  }
  if (!data.detailed_reason || data.detailed_reason.trim().length < 15) {
    errors.push({ field: 'detailed_reason', message: 'Detailed justification for escalation must be at least 15 characters' });
  }
  return errors;
}
