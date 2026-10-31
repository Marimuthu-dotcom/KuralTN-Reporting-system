// Backend/utils/response.js
export function successResponse(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
}

export function paginatedResponse(res, items, total, page = 1, limit = 10, message = 'Success') {
  const totalPages = Math.ceil(total / limit) || 1;
  return res.status(200).json({
    status: 'success',
    message,
    data: items,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
}
