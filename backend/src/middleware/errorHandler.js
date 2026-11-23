import { logger } from "../utils/logger.js";

export function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "The requested endpoint does not exist.",
    },
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  const isExposed = error.expose === true || status < 500;

  if (status >= 500 && !error.expose) {
    logger.error(`Unhandled error on ${req.method} ${req.path}: ${error.message}`);
  }

  return res.status(status).json({
    success: false,
    error: {
      code: error.code || (status >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR"),
      message: isExposed
        ? error.message
        : "An unexpected server error occurred.",
    },
  });
}
