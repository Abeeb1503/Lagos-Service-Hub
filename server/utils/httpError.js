class HttpError extends Error {
  constructor({ statusCode, code, error, message, details }) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.error = error
    this.details = details
  }
}

module.exports = {
  HttpError,
}

