const Joi = require('joi')
const { prisma } = require('../../config/database')
const { HttpError } = require('../../utils/httpError')

function parseDate(input) {
  const d = new Date(input)
  return Number.isNaN(d.getTime()) ? null : d
}

async function getReports(req, res, next) {
  try {
    const schema = Joi.object({
      from: Joi.string().required(),
      to: Joi.string().required(),
      format: Joi.string().valid('json', 'csv').default('json'),
    })
    const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true })
    if (error) {
      return next(new HttpError({ statusCode: 400, code: 'VALIDATION_ERROR', error: 'ValidationError', message: 'Invalid query params' }))
    }
    const from = parseDate(value.from)
    const to = parseDate(value.to)
    if (!from || !to) {
      return next(new HttpError({ statusCode: 400, code: 'VALIDATION_ERROR', error: 'ValidationError', message: 'Invalid date range' }))
    }

    const [deposits, payouts, jobsCompleted] = await Promise.all([
      prisma.paymentTransaction.findMany({
        where: { type: 'deposit', status: 'succeeded', createdAt: { gte: from, lte: to } },
        select: { amount: true, jobId: true, createdAt: true },
      }),
      prisma.paymentTransaction.findMany({
        where: { type: 'payout', status: 'succeeded', createdAt: { gte: from, lte: to } },
        select: { amount: true, jobId: true, createdAt: true },
      }),
      prisma.job.count({ where: { status: 'completed', updatedAt: { gte: from, lte: to } } }),
    ])

    const totalRevenue = deposits.reduce((s, x) => s + x.amount, 0)
    const totalPayouts = payouts.reduce((s, x) => s + x.amount, 0)

    const jobIds = Array.from(new Set(deposits.map((d) => d.jobId)))
    const jobs = await prisma.job.findMany({
      where: { id: { in: jobIds } },
      select: { id: true, platformCommission: true, sellerId: true },
    })
    const totalCommissions = jobs.reduce((s, j) => s + j.platformCommission, 0)

    const sellerIds = Array.from(new Set(jobs.map((j) => j.sellerId)))
    const profiles = await prisma.sellerProfile.findMany({
      where: { userId: { in: sellerIds } },
      select: { userId: true, category: true },
    })
    const categoryBySeller = new Map(profiles.map((p) => [p.userId, p.category]))
    const byCategory = {}
    for (const j of jobs) {
      const cat = categoryBySeller.get(j.sellerId) || 'Unknown'
      byCategory[cat] = (byCategory[cat] || 0) + 1
    }

    const payload = {
      from: from.toISOString(),
      to: to.toISOString(),
      totalRevenue,
      totalCommissions,
      totalPayouts,
      jobsCompleted,
      revenueByCategory: byCategory,
    }

    if (value.format === 'csv') {
      const lines = [
        'metric,value',
        `totalRevenue,${totalRevenue}`,
        `totalCommissions,${totalCommissions}`,
        `totalPayouts,${totalPayouts}`,
        `jobsCompleted,${jobsCompleted}`,
      ]
      res.setHeader('Content-Type', 'text/csv')
      return res.send(lines.join('\n'))
    }

    res.json(payload)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getReports,
}
