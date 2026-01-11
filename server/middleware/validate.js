const { HttpError } = require('../utils/httpError')

function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true })
    if (error) {
      return next(
        new HttpError({
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          error: 'ValidationError',
          message: 'Invalid request body',
          details: error.details.map((d) => ({ message: d.message, path: d.path })),
        })
      )
    }
    req.body = value
    next()
  }
}

function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true })
    if (error) {
      return next(
        new HttpError({
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          error: 'ValidationError',
          message: 'Invalid request query',
          details: error.details.map((d) => ({ message: d.message, path: d.path })),
        })
      )
    }
    req.query = value
    next()
  }
}

module.exports = {
  validateBody,
  validateQuery,
}

