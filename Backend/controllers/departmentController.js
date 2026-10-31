// Backend/controllers/departmentController.js
import { getDB } from '../config/db.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { complaintRepository } from '../repositories/complaintRepository.js';

export const departmentController = {
  getDepartments: asyncHandler(async (req, res) => {
    const db = getDB();
    const departments = db.departments || [];
    const complaints = db.complaints || [];

    // Enrich each department with live metrics
    const enriched = departments.map((dept) => {
      const deptComplaints = complaints.filter((c) => {
        if (c.department_id === dept.id) return true;
        return dept.category_ids && dept.category_ids.includes(c.category_id);
      });

      const total = deptComplaints.length;
      const resolved = deptComplaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
      const inProgress = deptComplaints.filter((c) => c.status === 'In Progress' || c.status === 'Under Review' || c.status === 'Resolution Proposed').length;
      const pending = deptComplaints.filter((c) => c.status === 'Submitted' || c.status === 'Acknowledged').length;

      const managedCategories = (db.categories || []).filter((cat) =>
        dept.category_ids && dept.category_ids.includes(cat.id)
      );

      return {
        ...dept,
        metrics: {
          total,
          resolved,
          inProgress,
          pending,
        },
        categories: managedCategories,
      };
    });

    return successResponse(res, enriched, 'Tamil Nadu Civic Departments retrieved');
  }),

  getDepartmentById: asyncHandler(async (req, res) => {
    const db = getDB();
    const { id } = req.params;
    const dept = (db.departments || []).find((d) => d.id === id || d.code.toLowerCase() === id.toLowerCase());

    if (!dept) {
      throw new AppError('Department record not found', 404);
    }

    const { complaints } = complaintRepository.findAll({
      department_id: dept.id,
      limit: 50,
    });

    const managedCategories = (db.categories || []).filter((cat) =>
      dept.category_ids && dept.category_ids.includes(cat.id)
    );

    return successResponse(
      res,
      {
        ...dept,
        categories: managedCategories,
        complaints,
        totalComplaints: complaints.length,
      },
      'Department details retrieved'
    );
  }),
};
