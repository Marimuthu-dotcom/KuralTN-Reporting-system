// Backend/middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  // Do not expose internal stack traces or database credentials to clients
  const responsePayload = {
    status,
    message: err.message || 'Internal server error occurred',
  };

  if (err.details) {
    responsePayload.details = err.details;
  }

  if (process.env.NODE_ENV === 'development') {
    responsePayload.code = err.code;
  }

  res.status(statusCode).json(responsePayload);
}
