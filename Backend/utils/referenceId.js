// Backend/utils/referenceId.js
/**
 * Generates human-readable, sequence-safe complaint reference IDs
 * e.g., CIV-2026-00048, ACC-2026-00013, ESC-2026-00089
 */
export function generateComplaintRef(existingCount = 0) {
  const year = new Date().getFullYear();
  const nextNum = (existingCount + 1).toString().padStart(5, '0');
  return `CIV-${year}-${nextNum}`;
}

export function generateAccountabilityRef(existingCount = 0) {
  const year = new Date().getFullYear();
  const nextNum = (existingCount + 1).toString().padStart(5, '0');
  return `ACC-${year}-${nextNum}`;
}

export function generateEscalationRef(existingCount = 0) {
  const year = new Date().getFullYear();
  const nextNum = (existingCount + 1).toString().padStart(5, '0');
  return `ESC-${year}-${nextNum}`;
}
