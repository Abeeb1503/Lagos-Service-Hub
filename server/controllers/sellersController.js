const crypto = require('crypto')
const { prisma } = require('../config/database')
const { HttpError } = require('../utils/httpError')
const { uploadFile, getPublicUrl, createSignedUrl } = require('../services/supabaseStorage')
const { ensureImage } = require('../middleware/upload')
const { sanitizeText } = require('../utils/sanitize')

async function publicSellerShape(user, profile, { includePrivate = false } = {}) {
  const area = user?.address?.area || null
  const idDoc =
    includePrivate && profile.idDocumentUrl
      ? await createSignedUrl({ bucket: 'id-documents', path: profile.idDocumentUrl, expiresIn: 3600 })
      : null
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    verified: user.verified,
    address: user.address,
    category: profile.category,
    summary: profile.summary,
    portfolioImages: profile.portfolioImages,
    idDocumentUrl: idDoc,
    testimonials: profile.testimonials,
    rating: profile.rating,
    reviewsCount: profile.reviewsCount,
    verificationStatus: profile.verificationStatus,
    area,
  }
}

async function createProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (!user) {
      return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'User not found' }))
    }
    const existing = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } })
    if (existing) {
      return next(new HttpError({ statusCode: 409, code: 'CONFLICT', error: 'Conflict', message: 'Seller profile already exists' }))
    }
    const profile = await prisma.sellerProfile.create({
      data: {
        userId: req.user.id,
        category: req.body.category,
        summary: sanitizeText(req.body.summary, { maxLen: 1000 }),
        portfolioImages: [],
        testimonials: [],
      },
    })
    res.status(201).json({ seller: await publicSellerShape(user, profile, { includePrivate: true }) })
  } catch (err) {
    next(err)
  }
}

async function listSellers(req, res, next) {
  try {
    const { page, limit, category, area, rating, search } = req.query

    const where = {}
    if (category) where.category = category
    if (typeof rating === 'number') where.rating = { gte: rating }
    if (search && search.trim()) {
      where.OR = [
        { summary: { contains: search.trim(), mode: 'insensitive' } },
        { user: { name: { contains: search.trim(), mode: 'insensitive' } } },
      ]
    }
    if (area) {
      where.user = where.user || {}
      where.user.address = { path: ['area'], equals: area }
    }

    const [total, items] = await Promise.all([
      prisma.sellerProfile.count({ where }),
      prisma.sellerProfile.findMany({
        where,
        include: { user: true },
        orderBy: [{ rating: 'desc' }, { reviewsCount: 'desc' }, { updatedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    res.json({
      data: await Promise.all(items.map((p) => publicSellerShape(p.user, p))),
      page,
      limit,
      total,
    })
  } catch (err) {
    next(err)
  }
}

async function getSeller(req, res, next) {
  try {
    const sellerId = req.params.id
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: sellerId },
      include: { user: true },
    })
    if (!profile) {
      return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'Seller not found' }))
    }
    const includePrivate = req.user && (req.user.role === 'admin' || req.user.id === sellerId)
    res.json({ seller: await publicSellerShape(profile.user, profile, { includePrivate }) })
  } catch (err) {
    next(err)
  }
}

async function updateProfile(req, res, next) {
  try {
    if (req.params.id !== req.user.id) {
      return next(new HttpError({ statusCode: 403, code: 'FORBIDDEN', error: 'Forbidden', message: 'Cannot edit this profile' }))
    }
    const profile = await prisma.sellerProfile.update({
      where: { userId: req.user.id },
      data: {
        ...req.body,
        ...(req.body.summary ? { summary: sanitizeText(req.body.summary, { maxLen: 1000 }) } : {}),
      },
      include: { user: true },
    })
    res.json({ seller: await publicSellerShape(profile.user, profile, { includePrivate: true }) })
  } catch (err) {
    next(err)
  }
}

async function uploadPortfolio(req, res, next) {
  try {
    const files = req.files || []
    if (!Array.isArray(files) || files.length < 4) {
      return next(new HttpError({ statusCode: 400, code: 'VALIDATION_ERROR', error: 'ValidationError', message: 'Upload at least 4 images' }))
    }
    for (const f of files) ensureImage(f)

    const profile = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } })
    if (!profile) {
      return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'Seller profile not found' }))
    }

    const uploaded = []
    for (const f of files) {
      const ext = f.mimetype === 'image/png' ? 'png' : 'jpg'
      const path = `${req.user.id}/${crypto.randomUUID()}.${ext}`
      const up = await uploadFile({ bucket: 'portfolios', path, buffer: f.buffer, contentType: f.mimetype })
      const url = await getPublicUrl(up)
      uploaded.push(url)
    }

    const updated = await prisma.sellerProfile.update({
      where: { userId: req.user.id },
      data: { portfolioImages: [...profile.portfolioImages, ...uploaded] },
      include: { user: true },
    })
    res.json({ seller: await publicSellerShape(updated.user, updated, { includePrivate: true }) })
  } catch (err) {
    next(err)
  }
}

async function uploadIdDocument(req, res, next) {
  try {
    if (!req.file) {
      return next(new HttpError({ statusCode: 400, code: 'VALIDATION_ERROR', error: 'ValidationError', message: 'Missing id document file' }))
    }
    ensureImage(req.file)
    const ext = req.file.mimetype === 'image/png' ? 'png' : 'jpg'
    const path = `${req.user.id}/${crypto.randomUUID()}.${ext}`
    const up = await uploadFile({ bucket: 'id-documents', path, buffer: req.file.buffer, contentType: req.file.mimetype })

    const updated = await prisma.sellerProfile.update({
      where: { userId: req.user.id },
      data: { idDocumentUrl: up.path },
      include: { user: true },
    })
    res.json({ seller: await publicSellerShape(updated.user, updated, { includePrivate: true }) })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  createProfile,
  listSellers,
  getSeller,
  updateProfile,
  uploadPortfolio,
  uploadIdDocument,
}
