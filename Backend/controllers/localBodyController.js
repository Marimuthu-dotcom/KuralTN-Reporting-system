// Backend/controllers/localBodyController.js
import { wardRepository } from '../repositories/wardRepository.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const localBodyController = {
  getAll: asyncHandler(async (req, res) => {
    const { district_id } = req.query;
    const localBodies = district_id
      ? wardRepository.findLocalBodiesByDistrict(district_id)
      : wardRepository.findAllLocalBodies();
    return successResponse(res, localBodies, 'Local bodies retrieved');
  }),

  getWards: asyncHandler(async (req, res) => {
    const wards = wardRepository.findWardsByLocalBody(req.params.id);
    return successResponse(res, wards, 'Wards for local body retrieved');
  }),
};
