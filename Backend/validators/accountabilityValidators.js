// Backend/validators/accountabilityValidators.js
export function validateAccountabilityReport(data) {
  const errors = [];
  const validConcerns = [
    'REPEATED_FAILURE_TO_RESPOND',
    'REPEATED_MISSED_DEADLINES_WITHOUT_EXPLANATION',
    'FALSE_CLAIM_OF_RESOLUTION',
    'IMPROPER_HANDLING',
    'OTHER_EVIDENCE_BASED_CONCERN',
  ];
  if (!data.concern_type || !validConcerns.includes(data.concern_type)) {
    errors.push({ field: 'concern_type', message: `Concern type must be one of: ${validConcerns.join(', ')}` });
  }
  if (!data.description || data.description.trim().length < 20) {
    errors.push({ field: 'description', message: 'Detailed description of the handling concern must be at least 20 characters' });
  }
  if (!data.reported_ward_id) {
    errors.push({ field: 'reported_ward_id', message: 'Ward identifier is required' });
  }
  return errors;
}

export function validateReviewerFinding(data) {
  const errors = [];
  if (!data.findings_or_notes || data.findings_or_notes.trim().length < 15) {
    errors.push({ field: 'findings_or_notes', message: 'Comprehensive findings and reason are mandatory' });
  }
  return errors;
}
