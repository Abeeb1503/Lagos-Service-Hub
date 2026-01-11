const { prisma } = require('../config/database')
const { HttpError } = require('../utils/httpError')
const crypto = require('crypto')
const { uploadFile, createSignedUrl } = require('../services/supabaseStorage')
const { ensureImage } = require('../middleware/upload')
const { sanitizeText } = require('../utils/sanitize')

async function assertJobAccess({ jobId, user }) {
  if (user.role === 'admin') return
  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { buyerId: true, sellerId: true } })
  if (!job) throw new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'Job not found' })
  if (job.buyerId !== user.id && job.sellerId !== user.id) {
    throw new HttpError({ statusCode: 403, code: 'FORBIDDEN', error: 'Forbidden', message: 'Cannot access this job chat' })
  }
}

async function listJobMessages(req, res, next) {
  try {
    const jobId = req.params.jobId
    await assertJobAccess({ jobId, user: req.user })

    const page = Number(req.query.page || 1)
    const limit = Math.min(100, Number(req.query.limit || 20))
    const skip = (page - 1) * limit

    const [total, items] = await Promise.all([
      prisma.chatMessage.count({ where: { jobId } }),
      prisma.chatMessage.findMany({
        where: { jobId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ])

    res.json({ data: items, page, limit, total })
  } catch (err) {
    next(err)
  }
}

async function listMessages(req, res, next) {
  try {
    const page = Number(req.query.page || 1)
    const limit = Math.min(100, Number(req.query.limit || 20))
    const skip = (page - 1) * limit

    const where = {}
    if (req.query.jobId) where.jobId = req.query.jobId
    if (req.user.role !== 'admin') {
      where.OR = [{ fromUserId: req.user.id }, { toUserId: req.user.id }]
    }

    const [total, items] = await Promise.all([
      prisma.chatMessage.count({ where }),
      prisma.chatMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ])

    res.json({ data: items, page, limit, total })
  } catch (err) {
    next(err)
  }
}

async function createMessage(req, res, next) {
  try {
    const { jobId, toUserId, text, attachments } = req.body
    const job = await prisma.job.findUnique({ where: { id: jobId }, select: { buyerId: true, sellerId: true } })
    if (!job) {
      return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'Job not found' }))
    }
    await assertJobAccess({ jobId, user: req.user })

    const allowedTo = new Set([job.buyerId, job.sellerId])
    if (!allowedTo.has(toUserId)) {
      return next(
        new HttpError({
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          error: 'ValidationError',
          message: 'Invalid recipient for this job',
        })
      )
    }
    if (req.user.role !== 'admin' && toUserId === req.user.id) {
      return next(
        new HttpError({
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          error: 'ValidationError',
          message: 'Cannot message yourself',
        })
      )
    }

    const msg = await prisma.chatMessage.create({
      data: {
        jobId,
        fromUserId: req.user.id,
        toUserId,
        messageText: sanitizeText(text, { maxLen: 4000 }),
        attachments: attachments || [],
      },
    })

    res.status(201).json({ message: msg })
  } catch (err) {
    next(err)
  }
}

async function markRead(req, res, next) {
  try {
    const id = req.params.id
    const msg = await prisma.chatMessage.findUnique({ where: { id } })
    if (!msg) return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'Message not found' }))
    await assertJobAccess({ jobId: msg.jobId, user: req.user })
    if (msg.toUserId !== req.user.id && req.user.role !== 'admin') {
      return next(new HttpError({ statusCode: 403, code: 'FORBIDDEN', error: 'Forbidden', message: 'Cannot mark this message' }))
    }
    const updated = await prisma.chatMessage.update({ where: { id }, data: { readAt: new Date() } })
    res.json({ message: updated })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listJobMessages,
  listMessages,
  createMessage,
  markRead,
  async uploadAttachment(req, res, next) {
    try {
      const jobId = req.params.jobId
      await assertJobAccess({ jobId, user: req.user })
      if (!req.file) {
        return next(new HttpError({ statusCode: 400, code: 'VALIDATION_ERROR', error: 'ValidationError', message: 'Missing file' }))
      }
      ensureImage(req.file)
      const ext = req.file.mimetype === 'image/png' ? 'png' : 'jpg'
      const path = `${jobId}/${crypto.randomUUID()}.${ext}`
      const up = await uploadFile({ bucket: 'chat-files', path, buffer: req.file.buffer, contentType: req.file.mimetype })
      const url = await createSignedUrl({ bucket: up.bucket, path: up.path, expiresIn: 3600 })
      res.status(201).json({ file: { bucket: up.bucket, path: up.path, url } })
    } catch (err) {
      next(err)
    }
  },
}
