const { prisma } = require('../../config/database')
const { HttpError } = require('../../utils/httpError')
const { writeAuditLog } = require('../../services/auditLog')
const { createTransferRecipient, initiateTransfer } = require('../../services/paystack')

function toKobo(naira) {
  return Math.round(Number(naira) * 100)
}

async function listQueue(req, res, next) {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: 'partial_completed' },
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

async function release(req, res, next) {
  try {
    const jobId = req.params.jobId
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        seller: { select: { id: true, name: true, address: true } },
      },
    })
    if (!job) return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'Job not found' }))
    if (job.status !== 'partial_completed') {
      return next(new HttpError({ statusCode: 400, code: 'INVALID_STATE', error: 'InvalidState', message: 'Job is not ready for escrow release' }))
    }
    const lastReport = (job.satisfactionReports || []).slice(-1)[0]
    if (!lastReport || Number(lastReport.percentage) < 50) {
      return next(new HttpError({ statusCode: 400, code: 'INVALID_STATE', error: 'InvalidState', message: 'Satisfaction must be at least 50%' }))
    }

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
      reason: `Lagos Service Hub payout for job ${job.id}`,
      reference: `payout_${job.id}`,
    })

    const updated = await prisma.$transaction(async (db) => {
      const tx = await db.paymentTransaction.create({
        data: {
          jobId: job.id,
          amount: payout,
          currency: 'NGN',
          type: 'payout',
          status: 'succeeded',
          providerReference: transfer.reference || `payout_${job.id}`,
          paystackData: transfer,
        },
      })
      const j = await db.job.update({ where: { id: job.id }, data: { status: 'completed' } })
      await db.auditLog.create({
        data: { action: 'escrow_released', adminId: req.user.id, jobId: job.id, details: { payout, recipient: recipient.recipient_code } },
      })
      return { tx, job: j }
    })

    res.json({ job: updated.job, payout: updated.tx })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listQueue,
  release,
}

