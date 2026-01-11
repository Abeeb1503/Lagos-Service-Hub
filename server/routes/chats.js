const express = require('express')
const Joi = require('joi')
const { requireAuth } = require('../middleware/auth')
const { validateBody, validateQuery } = require('../middleware/validate')
const { upload } = require('../middleware/upload')
const chatsController = require('../controllers/chatsController')

const router = express.Router()

router.get(
  '/messages',
  requireAuth,
  validateQuery(
    Joi.object({
      jobId: Joi.string().uuid().optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
    })
  ),
  chatsController.listMessages
)

router.post(
  '/messages',
  requireAuth,
  validateBody(
    Joi.object({
      jobId: Joi.string().uuid().required(),
      toUserId: Joi.string().uuid().required(),
      text: Joi.string().min(1).max(4000).required(),
      attachments: Joi.array().items(Joi.string().uri()).max(10).default([]),
    })
  ),
  chatsController.createMessage
)

router.get(
  '/jobs/:jobId/messages',
  requireAuth,
  validateQuery(
    Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
    })
  ),
  chatsController.listJobMessages
)

router.patch('/messages/:id/read', requireAuth, chatsController.markRead)
router.post('/jobs/:jobId/attachment', requireAuth, upload.single('file'), chatsController.uploadAttachment)

module.exports = router
