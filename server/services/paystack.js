const axios = require('axios')
const { HttpError } = require('../utils/httpError')

function getPaystackSecret() {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) {
    throw new HttpError({ statusCode: 500, code: 'CONFIG_ERROR', error: 'ConfigError', message: 'PAYSTACK_SECRET_KEY is not set' })
  }
  return key
}

function client() {
  const key = getPaystackSecret()
  return axios.create({
    baseURL: 'https://api.paystack.co',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    timeout: 20000,
  })
}

async function initializeTransaction({ email, amountKobo, callbackUrl, metadata, reference }) {
  try {
    const res = await client().post('/transaction/initialize', {
      email,
      amount: amountKobo,
      callback_url: callbackUrl,
      metadata,
      reference,
    })
    if (!res.data?.status) {
      throw new HttpError({ statusCode: 502, code: 'PAYSTACK_ERROR', error: 'PaystackError', message: res.data?.message || 'Paystack initialize failed' })
    }
    return res.data.data
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Paystack request failed'
    throw new HttpError({ statusCode: 502, code: 'PAYSTACK_ERROR', error: 'PaystackError', message: msg, details: err.response?.data })
  }
}

async function verifyTransaction(reference) {
  try {
    const res = await client().get(`/transaction/verify/${encodeURIComponent(reference)}`)
    if (!res.data?.status) {
      throw new HttpError({ statusCode: 502, code: 'PAYSTACK_ERROR', error: 'PaystackError', message: res.data?.message || 'Paystack verify failed' })
    }
    return res.data.data
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Paystack request failed'
    throw new HttpError({ statusCode: 502, code: 'PAYSTACK_ERROR', error: 'PaystackError', message: msg, details: err.response?.data })
  }
}

async function createTransferRecipient({ name, accountNumber, bankCode }) {
  try {
    const res = await client().post('/transferrecipient', {
      type: 'nuban',
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: 'NGN',
    })
    if (!res.data?.status) {
      throw new HttpError({ statusCode: 502, code: 'PAYSTACK_ERROR', error: 'PaystackError', message: res.data?.message || 'Paystack recipient failed' })
    }
    return res.data.data
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Paystack request failed'
    throw new HttpError({ statusCode: 502, code: 'PAYSTACK_ERROR', error: 'PaystackError', message: msg, details: err.response?.data })
  }
}

async function initiateTransfer({ recipientCode, amountKobo, reason, reference }) {
  try {
    const res = await client().post('/transfer', {
      source: 'balance',
      amount: amountKobo,
      recipient: recipientCode,
      reason,
      reference,
    })
    if (!res.data?.status) {
      throw new HttpError({ statusCode: 502, code: 'PAYSTACK_ERROR', error: 'PaystackError', message: res.data?.message || 'Paystack transfer failed' })
    }
    return res.data.data
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Paystack request failed'
    throw new HttpError({ statusCode: 502, code: 'PAYSTACK_ERROR', error: 'PaystackError', message: msg, details: err.response?.data })
  }
}

async function refundTransaction({ reference, amountKobo }) {
  try {
    const res = await client().post('/refund', {
      transaction: reference,
      amount: amountKobo,
    })
    if (!res.data?.status) {
      throw new HttpError({ statusCode: 502, code: 'PAYSTACK_ERROR', error: 'PaystackError', message: res.data?.message || 'Paystack refund failed' })
    }
    return res.data.data
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Paystack request failed'
    throw new HttpError({ statusCode: 502, code: 'PAYSTACK_ERROR', error: 'PaystackError', message: msg, details: err.response?.data })
  }
}

module.exports = {
  initializeTransaction,
  verifyTransaction,
  createTransferRecipient,
  initiateTransfer,
  refundTransaction,
}

