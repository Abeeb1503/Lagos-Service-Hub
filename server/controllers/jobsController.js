const crypto = require('crypto')
const { prisma } = require('../config/database')
const { HttpError } = require('../utils/httpError')
const { ESCROW_DEPOSIT, PLATFORM_COMMISSION } = require('../utils/constants')
const { uploadFile, getPublicUrl } = require('../services/supabaseStorage')
const { ensureImage } = require('../middleware/upload')
const { sanitizeText } = require('../utils/sanitize')

function sanitizeJob(job) {
  return {
    id: job.id,
    buyerId: job.buyerId,
    sellerId: job.sellerId,
    title: job.title,
    description: job.description,
    agreedAmount: job.agreedAmount,
    depositAmount: job.depositAmount,
    platformCommission: job.platformCommission,
    status: job.status,
    satisfactionReports: job.satisfactionReports,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  }
}

async function createJob(req, res, next) {
  try {
    const seller = await prisma.user.findUnique({ where: { id: req.body.sellerId } })
    if (!seller || seller.role !== 'seller') {
      return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'Seller not found' }))
    }

    const agreedAmount = req.body.agreedAmount
    const depositAmount = Math.round(agreedAmount * ESCROW_DEPOSIT * 100) / 100
    const platformCommission = Math.round(agreedAmount * PLATFORM_COMMISSION * 100) / 100

    const job = await prisma.job.create({
      data: {
        buyerId: req.user.id,
        sellerId: req.body.sellerId,
        title: sanitizeText(req.body.title, { maxLen: 200 }),
        description: sanitizeText(req.body.description, { maxLen: 5000 }),
        agreedAmount,
        depositAmount,
        platformCommission,
        satisfactionReports: [],
      },
    })

    res.status(201).json({ job: sanitizeJob(job) })
  } catch (err) {
    next(err)
  }
}

async function listJobs(req, res, next) {
  try {
    const where = {}
    if (req.user.role === 'buyer') where.buyerId = req.user.id
    if (req.user.role === 'seller') where.sellerId = req.user.id
    if (req.query.status) where.status = req.query.status

    const jobs = await prisma.job.findMany({
      where,
      include: {
        buyer: { select: { id: true, name: true, avatar: true } },
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            sellerProfile: { select: { category: true, rating: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    res.json({
      data: jobs.map((j) => ({
        ...sanitizeJob(j),
        buyer: j.buyer,
        seller: j.seller,
      })),
    })
  } catch (err) {
    next(err)
  }
}

async function getJob(req, res, next) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        buyer: { select: { id: true, name: true, email: true, avatar: true } },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            sellerProfile: { select: { category: true, rating: true } },
          },
        },
      },
    })
    if (!job) {
      return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'Job not found' }))
    }
    if (req.user.role !== 'admin' && job.buyerId !== req.user.id && job.sellerId !== req.user.id) {
      return next(new HttpError({ statusCode: 403, code: 'FORBIDDEN', error: 'Forbidden', message: 'Cannot access this job' }))
    }
    res.json({ job })
  } catch (err) {
    next(err)
  }
}

function isAllowedTransition(from, to, { isBuyer, isSeller }) {
  if (from === to) return true
  if (from === 'proposed' && to === 'cancelled' && isBuyer) return true
  if (from === 'proposed' && to === 'funded' && isBuyer) return true
  if (from === 'funded' && to === 'in_progress' && isSeller) return true
  if (from === 'in_progress' && to === 'partial_completed' && isSeller) return true
  if (from === 'partial_completed' && to === 'completed' && isBuyer) return true
  if ((from === 'in_progress' || from === 'partial_completed') && to === 'disputed' && (isBuyer || isSeller)) return true
  return false
}

async function updateStatus(req, res, next) {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } })
    if (!job) {
      return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'Job not found' }))
    }
    const isBuyer = job.buyerId === req.user.id
    const isSeller = job.sellerId === req.user.id
    if (req.user.role !== 'admin' && !isBuyer && !isSeller) {
      return next(new HttpError({ statusCode: 403, code: 'FORBIDDEN', error: 'Forbidden', message: 'Cannot update this job' }))
    }

    const nextStatus = req.body.status
    if (!isAllowedTransition(job.status, nextStatus, { isBuyer, isSeller })) {
      return next(
        new HttpError({
          statusCode: 400,
          code: 'INVALID_STATUS',
          error: 'InvalidStatus',
          message: `Cannot transition from ${job.status} to ${nextStatus}`,
        })
      )
    }

    const updated = await prisma.job.update({
      where: { id: job.id },
      data: { status: nextStatus },
    })
    res.json({ job: sanitizeJob(updated) })
  } catch (err) {
    next(err)
  }
}

async function submitSatisfaction(req, res, next) {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } })
    if (!job) {
      return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'Job not found' }))
    }
    if (job.buyerId !== req.user.id) {
      return next(new HttpError({ statusCode: 403, code: 'FORBIDDEN', error: 'Forbidden', message: 'Cannot submit report for this job' }))
    }
    const files = req.files || []
    const urls = []
    for (const f of files) {
      ensureImage(f)
      const ext = f.mimetype === 'image/png' ? 'png' : 'jpg'
      const path = `${job.id}/${crypto.randomUUID()}.${ext}`
      const up = await uploadFile({ bucket: 'job-photos', path, buffer: f.buffer, contentType: f.mimetype })
      const url = await getPublicUrl(up)
      urls.push(url)
    }

    const entry = {
      id: crypto.randomUUID(),
      percentage: req.body.percentage,
      comments: req.body.comments,
      photos: urls,
      createdAt: new Date().toISOString(),
    }

    const updated = await prisma.job.update({
      where: { id: job.id },
      data: { satisfactionReports: [...job.satisfactionReports, entry] },
    })

    res.json({ job: sanitizeJob(updated) })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  createJob,
  listJobs,
  getJob,
  updateStatus,
  submitSatisfaction,
}
