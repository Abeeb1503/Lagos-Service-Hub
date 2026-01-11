const Joi = require('joi')
const { prisma } = require('../../config/database')
const { HttpError } = require('../../utils/httpError')
const { writeAuditLog } = require('../../services/auditLog')
const { refundTransaction, createTransferRecipient, initiateTransfer } = require('../../services/paystack')

function toKobo(naira) {
  return Math.round(Number(naira) * 100)
}

async function listDisputes(req, res, next) {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: 'disputed' },
      include: {
        buyer: { select: { id: true, name: true, email: true, avatar: true } },
        seller: { select: { id: true, name: true, email: true, avatar: true, address: true } },
      },
      orderBy: { updatedAt: 'asc' },
    })
    res.json({ data: jobs })
  } catch (err) {
    next(err)
  }
}

async function resolve(req, res, next) {
  try {
    const schema = Joi.object({
      action: Joi.string().valid('full_refund', 'partial_refund', 'release_to_seller').required(),
      notes: Joi.string().min(2).max(4000).required(),
      percent: Joi.number().min(1).max(100).optional(),
    })
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true })
    if (error) {
      return next(new HttpError({ statusCode: 400, code: 'VALIDATION_ERROR', error: 'ValidationError', message: 'Invalid request body' }))
    }

    const jobId = req.params.jobId
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        buyer: { select: { id: true, email: true } },
        seller: { select: { id: true, name: true, address: true } },
      },
    })
    if (!job) return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'Job not found' }))
    if (job.status !== 'disputed') {
      return next(new HttpError({ statusCode: 400, code: 'INVALID_STATE', error: 'InvalidState', message: 'Job is not disputed' }))
    }

    const depositTx = await prisma.paymentTransaction.findFirst({
      where: { jobId: job.id, type: 'deposit', status: 'succeeded' },
      orderBy: { createdAt: 'desc' },
    })

    let result = { action: value.action }

    if (value.action === 'full_refund' || value.action === 'partial_refund') {
      if (!depositTx) {
        return next(new HttpError({ statusCode: 400, code: 'MISSING_PAYMENT', error: 'InvalidState', message: 'No succeeded deposit found' }))
      }
      const pct = value.action === 'full_refund' ? 100 : Math.max(1, Math.min(100, Number(value.percent || 0)))
      const refundAmount = Math.round((depositTx.amount * (pct / 100)) * 100) / 100
      const refund = await refundTransaction({ reference: depositTx.providerReference, amountKobo: toKobo(refundAmount) })
      await prisma.paymentTransaction.create({
        data: {
          jobId: job.id,
          amount: refundAmount,
          currency: 'NGN',
          type: 'refund',
          status: 'refunded',
          providerReference: refund.reference || `refund_${job.id}_${Date.now()}`,
          paystackData: refund,
        },
      })
      await prisma.job.update({ where: { id: job.id }, data: { status: 'cancelled' } })
      result = { ...result, refundAmount }
    }

    if (value.action === 'release_to_seller') {
      const payout = Math.round((job.agreedAmount - job.platformCommission) * 100) / 100
      const bank = job.seller.address?.bank || {}
      if (!bank.accountNumber || !bank.bankCode) {
        return next(new HttpError({ statusCode: 400, code: 'MISSING_BANK', error: 'ValidationError', message: 'Seller bank details missing' }))
      }
      const recipient = await createTransferRecipient({
        name: job.seller.name,
        accountNumber: String(bank.accountNumber),
        bankCode: String(bank.bankCode),
      })
      const transfer = await initiateTransfer({
        recipientCode: recipient.recipient_code,
        amountKobo: toKobo(payout),
        reason: `Dispute resolution payout for job ${job.id}`,
        reference: `payout_${job.id}_dispute`,
      })
      await prisma.paymentTransaction.create({
        data: {
          jobId: job.id,
          amount: payout,
          currency: 'NGN',
          type: 'payout',
          status: 'succeeded',
          providerReference: transfer.reference || `payout_${job.id}_dispute`,
          paystackData: transfer,
        },
      })
      await prisma.job.update({ where: { id: job.id }, data: { status: 'completed' } })
      result = { ...result, payout }
    }

    await writeAuditLog({ action: 'dispute_resolved', adminId: req.user.id, jobId: job.id, details: { ...result, notes: value.notes } })

    res.json({ ok: true, result })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listDisputes,
  resolve,
}

