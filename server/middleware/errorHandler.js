function notFoundHandler(req, res) {
  res.status(404).json({ error: 'NotFound', message: 'Route not found', code: 'NOT_FOUND' })
}

function errorHandler(err, req, res, next) {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'ValidationError', message: 'File too large (max 5MB)', code: 'VALIDATION_ERROR' })
  }
  const status = err.statusCode || err.status || 500
  const payload = {
    error: err.error || 'ServerError',
    message: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
  }
  if (process.env.NODE_ENV !== 'production' && err.details) {
    payload.details = err.details
  }
  res.status(status).json(payload)
}

module.exports = {
  notFoundHandler,
  errorHandler,
}
