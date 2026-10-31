// Backend/controllers/wardController.js
import { wardRepository } from '../repositories/wardRepository.js';
import { complaintRepository } from '../repositories/complaintRepository.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const wardController = {
  getAll: asyncHandler(async (req, res) => {
    const wards = wardRepository.findAllWards();
    return successResponse(res, wards, 'Wards retrieved');
  }),

  getById: asyncHandler(async (req, res) => {
    const ward = wardRepository.findWardById(req.params.id);
    if (!ward) {
      return res.status(404).json({ status: 'fail', message: 'Ward not found' });
    }
    // Summary counts for this ward
    const { complaints, total } = complaintRepository.findAll({ ward_id: req.params.id, limit: 100 });
    const resolvedCount = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
    const inProgressCount = complaints.filter((c) => c.status === 'In Progress' || c.status === 'Acknowledged').length;

    return successResponse(
      res,
      {
        ...ward,
        stats: {
          total_complaints: total,
          resolved_complaints: resolvedCount,
          active_complaints: inProgressCount,
        },
      },
      'Ward profile retrieved'
    );
  }),

  getMembers: asyncHandler(async (req, res) => {
    const members = wardRepository.findWardMembers(req.params.id);
    return successResponse(res, members, 'Ward members directory');
  }),

  getCategories: asyncHandler(async (req, res) => {
    const categories = wardRepository.findAllCategories();
    return successResponse(res, categories, 'Grievance categories retrieved');
  }),
};
