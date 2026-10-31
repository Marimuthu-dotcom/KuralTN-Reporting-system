// Backend/controllers/districtController.js
import { wardRepository } from '../repositories/wardRepository.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const districtController = {
  getAll: asyncHandler(async (req, res) => {
    const districts = wardRepository.findAllDistricts();
    return successResponse(res, districts, 'Tamil Nadu districts list');
  }),

  getById: asyncHandler(async (req, res) => {
    const district = wardRepository.findDistrictById(req.params.id);
    if (!district) {
      return res.status(404).json({ status: 'fail', message: 'District not found' });
    }
    const localBodies = wardRepository.findLocalBodiesByDistrict(req.params.id);
    return successResponse(res, { ...district, local_bodies: localBodies }, 'District details');
  }),
};
