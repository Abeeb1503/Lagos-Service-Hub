const express = require('express')
const { requireAuth, requireRole } = require('../middleware/auth')
const { validateBody } = require('../middleware/validate')
const { verifyPaystackSignature } = require('../middleware/paystackWebhook')
const paymentsController = require('../controllers/paymentsController')

const router = express.Router()

router.post(
  '/initialize',
  requireAuth,
  requireRole('buyer'),
  validateBody(
    require('joi').object({
      jobId: require('joi').string().uuid().required(),
    })
  ),
  paymentsController.initialize
)

router.post('/webhook', verifyPaystackSignature, paymentsController.webhook)
router.get('/verify/:reference', requireAuth, paymentsController.verify)

module.exports = router

