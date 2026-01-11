const multer = require('multer')
const { HttpError } = require('../utils/httpError')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})

function ensureImage(file) {
  const ok = file && (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
  if (!ok) {
    throw new HttpError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      error: 'ValidationError',
      message: 'Only JPG/PNG images are allowed',
    })
  }
}

module.exports = {
  upload,
  ensureImage,
}

