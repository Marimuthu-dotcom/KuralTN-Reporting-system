// Backend/middleware/authorizeWard.js
import { AppError } from '../utils/AppError.js';
import { getDB } from '../config/db.js';

/**
 * Validates that the authenticated user belongs to the complaint's ward
 * or has role-based authority over that specific ward.
 */
export function authorizeWardAccess(action = 'participate') {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return next(new AppError('Authentication required.', 401));
    }

    // Admins bypass ward locality restrictions for platform governance
    if (user.role === 'ADMIN') {
      return next();
    }

    const complaintId = req.params.id || req.body.complaint_id;
    const targetWardId = req.params.wardId || req.body.ward_id;

    const db = getDB();

    if (complaintId) {
      const complaint = db.complaints.find((c) => c.id === complaintId);
      if (!complaint) {
        return next(new AppError('Complaint not found.', 404));
      }

      req.targetComplaint = complaint;

      // Councillor check: Councillor can only manage complaints within their assigned ward
      if (user.role === 'WARD_COUNCILLOR' && complaint.ward_id !== user.ward_id) {
        return next(
          new AppError(
            `Cross-ward restriction: You are assigned to Ward ${user.ward_id} and cannot manage complaints in Ward ${complaint.ward_id}.`,
            403
          )
        );
      }

      // Citizen check: Citizens can only support or comment on complaints in their registered ward
      if (user.role === 'CITIZEN' && complaint.ward_id !== user.ward_id) {
        return next(
          new AppError(
            'This complaint belongs to another ward. You can view it, but participation is restricted to eligible ward members.',
            403
          )
        );
      }
    } else if (targetWardId) {
      if (user.role === 'CITIZEN' && targetWardId !== user.ward_id) {
        return next(
          new AppError(
            'Participation is restricted to eligible members registered in this ward.',
            403
          )
        );
      }
      if (user.role === 'WARD_COUNCILLOR' && targetWardId !== user.ward_id) {
        return next(
          new AppError(
            'You are not authorized to manage or broadcast in a ward outside your jurisdiction.',
            403
          )
        );
      }
    }

    next();
  };
}
