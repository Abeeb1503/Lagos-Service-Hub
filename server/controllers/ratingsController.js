const crypto = require('crypto')
const { prisma } = require('../config/database')
const { HttpError } = require('../utils/httpError')
const { sanitizeText } = require('../utils/sanitize')

function computeAverageStars(testimonials) {
  if (!testimonials.length) return 0
  const sum = testimonials.reduce((acc, t) => acc + Number(t.stars || 0), 0)
  return Math.round((sum / testimonials.length) * 10) / 10
}

async function createRating(req, res, next) {
  try {
    const sellerId = req.params.id
    const { jobId, stars, review } = req.body

    const job = await prisma.job.findUnique({ where: { id: jobId } })
    if (!job) {
      return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'Job not found' }))
    }
    if (job.buyerId !== req.user.id || job.sellerId !== sellerId) {
      return next(new HttpError({ statusCode: 403, code: 'FORBIDDEN', error: 'Forbidden', message: 'Cannot rate this seller for this job' }))
    }
    if (job.status !== 'completed') {
      return next(new HttpError({ statusCode: 400, code: 'INVALID_STATE', error: 'InvalidState', message: 'Job must be completed before rating' }))
    }

    const [profile, buyer] = await Promise.all([
      prisma.sellerProfile.findUnique({ where: { userId: sellerId } }),
      prisma.user.findUnique({ where: { id: req.user.id } }),
    ])
    if (!profile) {
      return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'Seller profile not found' }))
    }
    if (!buyer) {
      return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'Buyer not found' }))
    }

    const existing = profile.testimonials || []
    const already = existing.some((t) => t && t.jobId === jobId && t.buyerId === req.user.id)
    if (already) {
      return next(new HttpError({ statusCode: 409, code: 'CONFLICT', error: 'Conflict', message: 'Rating already submitted for this job' }))
    }

    const testimonial = {
      id: crypto.randomUUID(),
      jobId,
      buyerId: req.user.id,
      buyerName: buyer.name,
      stars,
      review: sanitizeText(review, { maxLen: 2000 }),
      createdAt: new Date().toISOString(),
    }

    const updatedTestimonials = [...existing, testimonial]
    const updated = await prisma.sellerProfile.update({
      where: { userId: sellerId },
      data: {
        testimonials: updatedTestimonials,
        reviewsCount: updatedTestimonials.length,
        rating: computeAverageStars(updatedTestimonials),
      },
    })

    res.status(201).json({
      rating: testimonial,
      seller: { userId: updated.userId, rating: updated.rating, reviewsCount: updated.reviewsCount },
    })
  } catch (err) {
    next(err)
  }
}

async function listRatings(req, res, next) {
  try {
    const sellerId = req.params.id
    const profile = await prisma.sellerProfile.findUnique({ where: { userId: sellerId } })
    if (!profile) {
      return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'Seller profile not found' }))
    }
    res.json({ data: profile.testimonials || [] })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  createRating,
  listRatings,
}
