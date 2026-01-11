const Joi = require('joi')
const { prisma } = require('../config/database')
const { authenticateSocket } = require('./auth')
const { sanitizeText } = require('../utils/sanitize')

const joinSchema = Joi.object({ jobId: Joi.string().uuid().required() })
const typingSchema = Joi.object({ jobId: Joi.string().uuid().required(), isTyping: Joi.boolean().required() })
const sendSchema = Joi.object({
  jobId: Joi.string().uuid().required(),
  toUserId: Joi.string().uuid().required(),
  text: Joi.string().min(1).max(4000).required(),
  attachments: Joi.array().items(Joi.string().uri()).max(10).default([]),
})

async function canAccessJob({ jobId, userId, role }) {
  if (role === 'admin') return true
  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { buyerId: true, sellerId: true } })
  if (!job) return false
  return job.buyerId === userId || job.sellerId === userId
}

function registerChatSockets(io) {
  io.use(authenticateSocket)

  io.on('connection', (socket) => {
    socket.on('join_room', async (payload, cb) => {
      const { error, value } = joinSchema.validate(payload, { abortEarly: false, stripUnknown: true })
      if (error) return cb ? cb({ ok: false }) : null
      const ok = await canAccessJob({ jobId: value.jobId, userId: socket.user.id, role: socket.user.role })
      if (!ok) return cb ? cb({ ok: false }) : null
      socket.join(value.jobId)
      return cb ? cb({ ok: true }) : null
    })

    socket.on('typing', async (payload) => {
      const { error, value } = typingSchema.validate(payload, { abortEarly: false, stripUnknown: true })
      if (error) return
      const ok = await canAccessJob({ jobId: value.jobId, userId: socket.user.id, role: socket.user.role })
      if (!ok) return
      socket.to(value.jobId).emit('typing', { jobId: value.jobId, userId: socket.user.id, isTyping: value.isTyping })
    })

    socket.on('send_message', async (payload, cb) => {
      const { error, value } = sendSchema.validate(payload, { abortEarly: false, stripUnknown: true })
      if (error) return cb ? cb({ ok: false }) : null
      const ok = await canAccessJob({ jobId: value.jobId, userId: socket.user.id, role: socket.user.role })
      if (!ok) return cb ? cb({ ok: false }) : null

      const msg = await prisma.chatMessage.create({
        data: {
          jobId: value.jobId,
          fromUserId: socket.user.id,
          toUserId: value.toUserId,
          messageText: sanitizeText(value.text, { maxLen: 4000 }),
          attachments: value.attachments,
        },
      })
      io.to(value.jobId).emit('receive_message', msg)
      return cb ? cb({ ok: true, message: msg }) : null
    })
  })
}

module.exports = {
  registerChatSockets,
}
