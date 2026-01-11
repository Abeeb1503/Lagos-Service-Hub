const crypto = require('crypto')
const { prisma } = require('../config/database')
const { HttpError } = require('../utils/httpError')
const { initializeTransaction, verifyTransaction } = require('../services/paystack')
const { writeAuditLog } = require('../services/auditLog')
const { ESCROW_DEPOSIT } = require('../utils/constants')

function toKobo(naira) {
  return Math.round(Number(naira) * 100)
}

async function initialize(req, res, next) {
  try {
    const { jobId } = req.body
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { buyer: true } })
    if (!job) return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'Job not found' }))
    if (job.buyerId !== req.user.id) return next(new HttpError({ statusCode: 403, code: 'FORBIDDEN', error: 'Forbidden', message: 'Not your job' }))
    if (job.status !== 'proposed') return next(new HttpError({ statusCode: 400, code: 'INVALID_STATE', error: 'InvalidState', message: 'Job is not payable' }))

    const depositAmount = Math.round(job.agreedAmount * ESCROW_DEPOSIT * 100) / 100
    const reference = crypto.randomUUID()

    const callbackUrl = `${process.env.FRONTEND_URL || ''}/payment/${job.id}`
    const paystack = await initializeTransaction({
      email: job.buyer.email,
      amountKobo: toKobo(depositAmount),
      callbackUrl,
      metadata: { jobId: job.id, buyerId: job.buyerId, sellerId: job.sellerId, type: 'deposit' },
      reference,
    })

    await prisma.paymentTransaction.create({
      data: {
        jobId: job.id,
        amount: depositAmount,
        currency: 'NGN',
        type: 'deposit',
        status: 'pending',
        providerReference: reference,
        paystackData: paystack,
      },
    })
    await writeAuditLog({ action: 'payment_initialize', userId: req.user.id, jobId: job.id, details: { reference, amount: depositAmount } })

    res.status(201).json({ authorization_url: paystack.authorization_url, reference })
  } catch (err) {
    next(err)
  }
}

async function webhook(req, res, next) {
  try {
    const event = req.body
    const data = event?.data
    const reference = data?.reference
    if (!reference) {
      return next(new HttpError({ statusCode: 400, code: 'INVALID_WEBHOOK', error: 'InvalidWebhook', message: 'Missing reference' }))
    }

    const tx = await prisma.paymentTransaction.findUnique({ where: { providerReference: reference } })
    if (!tx) {
      await writeAuditLog({ action: 'payment_webhook_unmatched', jobId: data?.metadata?.jobId, details: { reference, event: event?.event } })
      return res.json({ ok: true })
    }
    if (tx.status === 'succeeded') {
      return res.json({ ok: true })
    }

    if (event.event === 'charge.success') {
      await prisma.$transaction(async (db) => {
        await db.paymentTransaction.update({
          where: { id: tx.id },
          data: { status: 'succeeded', paystackData: data },
        })
        await db.job.update({
          where: { id: tx.jobId },
          data: { status: 'funded' },
        })
        await db.auditLog.create({
          data: {
            action: 'payment_succeeded',
            userId: null,
            adminId: null,
            jobId: tx.jobId,
            details: { reference, amount: tx.amount },
          },
        })
      })
    } else if (event.event && event.event.startsWith('charge.')) {
      await prisma.paymentTransaction.update({
        where: { id: tx.id },
        data: { status: 'failed', paystackData: data },
      })
      await writeAuditLog({ action: 'payment_failed', jobId: tx.jobId, details: { reference, event: event.event } })
    }

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

async function verify(req, res, next) {
  try {
    const reference = req.params.reference
    const tx = await prisma.paymentTransaction.findUnique({ where: { providerReference: reference } })
    if (!tx) return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'Payment not found' }))

    const data = await verifyTransaction(reference)
    const status = data.status === 'success' ? 'succeeded' : data.status === 'failed' ? 'failed' : 'pending'

    const updated = await prisma.paymentTransaction.update({
      where: { id: tx.id },
      data: { status, paystackData: data },
    })
    res.json({ payment: updated })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  initialize,
  webhook,
  verify,
}

