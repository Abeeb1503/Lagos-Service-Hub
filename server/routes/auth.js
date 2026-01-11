const express = require('express')
const { authRateLimiter } = require('../middleware/rateLimit')
const { validateBody } = require('../middleware/validate')
const { requireAuth } = require('../middleware/auth')
const { registerSchema, loginSchema } = require('../utils/validators')
const authController = require('../controllers/authController')

const router = express.Router()

router.use(authRateLimiter)

router.post('/register', validateBody(registerSchema), authController.register)
router.post('/login', validateBody(loginSchema), authController.login)
router.post('/refresh', authController.refresh)
router.get('/me', requireAuth, authController.me)

module.exports = router
