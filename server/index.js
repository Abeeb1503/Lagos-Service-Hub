const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const dotenv = require('dotenv')
// SOCKET.IO - UNCOMMENT FOR PRODUCTION
// const http = require('http')
// const { Server } = require('socket.io')
const { generalRateLimiter } = require('./middleware/rateLimit')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')

dotenv.config({ path: process.env.ENV_FILE || undefined })

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const sellerRoutes = require('./routes/sellers')
const jobRoutes = require('./routes/jobs')
const paymentRoutes = require('./routes/payments')
const chatRoutes = require('./routes/chats')
const adminRoutes = require('./routes/admin')
// SOCKET.IO - UNCOMMENT FOR PRODUCTION
// const { registerChatSockets } = require('./socket/chat')

const app = express()

const allowedOrigins = String(process.env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(helmet())
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (allowedOrigins.length === 0) return cb(null, true)
      return allowedOrigins.includes(origin) ? cb(null, true) : cb(null, false)
    },
    credentials: true,
  })
)
app.use(
  express.json({
    limit: '2mb',
    verify: (req, res, buf) => {
      if (req.originalUrl === '/api/payments/webhook') {
        req.rawBody = buf
      }
    },
  })
)
app.use(generalRateLimiter)

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/sellers', sellerRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/admin', adminRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

const port = Number(process.env.PORT || 3000)

// SOCKET.IO - UNCOMMENT FOR PRODUCTION
// const server = http.createServer(app)
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
//   },
// })
// registerChatSockets(io)
// server.listen(port, () => {
//   process.stdout.write(`Server listening on http://localhost:${port}\n`)
// })

if (require.main === module) {
  app.listen(port, () => {
    process.stdout.write(`Server listening on http://localhost:${port}\n`)
  })
}

module.exports = app
