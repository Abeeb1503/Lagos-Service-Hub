const rateLimit = require('express-rate-limit')

const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: 'RateLimited', message: 'Too many requests', code: 'RATE_LIMITED' })
  },
})

const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: 'RateLimited', message: 'Too many requests', code: 'RATE_LIMITED' })
  },
})

module.exports = {
  authRateLimiter,
  generalRateLimiter,
}
