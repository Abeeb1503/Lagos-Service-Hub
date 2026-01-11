const crypto = require('crypto')
const { prisma } = require('../config/database')
const { HttpError } = require('../utils/httpError')
const { uploadFile, getPublicUrl } = require('../services/supabaseStorage')
const { ensureImage } = require('../middleware/upload')

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    address: user.address,
    verified: user.verified,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (!user) {
      return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'User not found' }))
    }
    res.json({ user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
}

async function updateMe(req, res, next) {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: req.body,
    })
    res.json({ user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
}

async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      return next(new HttpError({ statusCode: 400, code: 'VALIDATION_ERROR', error: 'ValidationError', message: 'Missing avatar file' }))
    }
    ensureImage(req.file)
    const ext = req.file.mimetype === 'image/png' ? 'png' : 'jpg'
    const name = `${req.user.id}/${crypto.randomUUID()}.${ext}`
    const uploaded = await uploadFile({
      bucket: 'avatars',
      path: name,
      buffer: req.file.buffer,
      contentType: req.file.mimetype,
    })
    const url = await getPublicUrl(uploaded)
    const user = await prisma.user.update({ where: { id: req.user.id }, data: { avatar: url } })
    res.json({ user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getMe,
  updateMe,
  uploadAvatar,
}
