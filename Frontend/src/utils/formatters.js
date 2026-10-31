// Frontend/src/utils/formatters.js
export function formatStatusLabel(status) {
  return status || 'Unknown';
}

export function formatDeadlineType(type) {
  if (!type) return 'Target Not Confirmed';
  const map = {
    VERIFIED_OFFICIAL_TIMELINE: 'Verified Citizen Charter Rule',
    DEPARTMENT_PROVIDED_TARGET: 'Department Official Commitment',
    ADMINISTRATOR_CONFIGURED_TARGET: 'Administrative Target',
    ESTIMATED_TARGET: 'Estimated SLA Target',
    DEADLINE_NOT_CONFIRMED: 'Pending Department Review',
  };
  return map[type] || type.replace(/_/g, ' ');
}

export function truncateText(text, max = 120) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '...' : text;
}
