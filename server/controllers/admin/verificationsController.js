const Joi = require('joi')
const { prisma } = require('../../config/database')
const { HttpError } = require('../../utils/httpError')
const { writeAuditLog } = require('../../services/auditLog')

async function listPending(req, res, next) {
  try {
    const items = await prisma.sellerProfile.findMany({
      where: { verificationStatus: 'pending' },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    })
    res.json({
      data: items.map((p) => ({
        sellerId: p.userId,
        name: p.user.name,
        email: p.user.email,
        avatar: p.user.avatar,
        category: p.category,
        verificationStatus: p.verificationStatus,
        createdAt: p.createdAt,
      })),
    })
  } catch (err) {
    next(err)
  }
}

async function approve(req, res, next) {
  try {
    const sellerId = req.params.sellerId
    const profile = await prisma.sellerProfile.findUnique({ where: { userId: sellerId } })
    if (!profile) return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'Seller profile not found' }))

    const updated = await prisma.$transaction(async (db) => {
      await db.user.update({ where: { id: sellerId }, data: { verified: true } })
      const p = await db.sellerProfile.update({ where: { userId: sellerId }, data: { verificationStatus: 'approved' } })
      await db.auditLog.create({
        data: { action: 'seller_verification_approved', adminId: req.user.id, userId: sellerId, details: {} },
      })
      return p
    })

    res.json({ sellerId: updated.userId, verificationStatus: updated.verificationStatus })
  } catch (err) {
    next(err)
  }
}

async function reject(req, res, next) {
  try {
    const schema = Joi.object({ reason: Joi.string().min(2).max(2000).required() })
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true })
    if (error) {
      return next(new HttpError({ statusCode: 400, code: 'VALIDATION_ERROR', error: 'ValidationError', message: 'Invalid request body' }))
    }

    const sellerId = req.params.sellerId
    const profile = await prisma.sellerProfile.findUnique({ where: { userId: sellerId } })
    if (!profile) return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'Seller profile not found' }))

    const updated = await prisma.sellerProfile.update({ where: { userId: sellerId }, data: { verificationStatus: 'rejected' } })
    await writeAuditLog({ action: 'seller_verification_rejected', adminId: req.user.id, userId: sellerId, details: { reason: value.reason } })

    res.json({ sellerId: updated.userId, verificationStatus: updated.verificationStatus })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listPending,
  approve,
  reject,
}

