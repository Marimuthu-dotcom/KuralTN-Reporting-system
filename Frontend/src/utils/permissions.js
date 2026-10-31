// Frontend/src/utils/permissions.js
export function canUserManageComplaint(user, complaint) {
  if (!user || !complaint) return false;
  if (user.role === 'ADMIN') return true;
  if (user.role === 'WARD_COUNCILLOR' && user.ward_id === complaint.ward_id) return true;
  if (user.role === 'DEPARTMENT_HANDLER') return true;
  return false;
}

export function canUserInteractWithWard(user, wardId) {
  if (!user || !wardId) return false;
  if (user.role === 'ADMIN') return true;
  return user.ward_id === wardId;
}

export function canUserConfirmOrDispute(user, complaint) {
  if (!user || !complaint) return false;
  return complaint.user_id === user.id && complaint.status === 'Resolution Proposed';
}

export function canUserEscalate(user, complaint) {
  if (!user || !complaint) return false;
  return complaint.user_id === user.id && complaint.status !== 'Resolved' && complaint.status !== 'Closed';
}
