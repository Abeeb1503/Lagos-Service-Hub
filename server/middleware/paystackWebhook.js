const crypto = require('crypto')
const { HttpError } = require('../utils/httpError')

function verifyPaystackSignature(req, res, next) {
  const signature = req.headers['x-paystack-signature']
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET
  if (!secret) {
    return next(new HttpError({ statusCode: 500, code: 'CONFIG_ERROR', error: 'ConfigError', message: 'PAYSTACK_WEBHOOK_SECRET is not set' }))
  }
  if (!signature || !req.rawBody) {
    return next(new HttpError({ statusCode: 400, code: 'INVALID_WEBHOOK', error: 'InvalidWebhook', message: 'Missing webhook signature or body' }))
  }
  const computed = crypto.createHmac('sha512', secret).update(req.rawBody).digest('hex')
  if (computed !== signature) {
    return next(new HttpError({ statusCode: 401, code: 'UNAUTHORIZED', error: 'Unauthorized', message: 'Invalid webhook signature' }))
  }
  next()
}

module.exports = {
  verifyPaystackSignature,
}

