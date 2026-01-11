const jwt = require('jsonwebtoken')
const { parseCookies } = require('../middleware/auth')

function getTokenFromSocket(socket) {
  const authHeader = socket.handshake.headers?.authorization || ''
  if (authHeader.toLowerCase().startsWith('bearer ')) return authHeader.slice(7).trim()
  const cookieHeader = socket.handshake.headers?.cookie
  const cookies = parseCookies(cookieHeader)
  if (cookies.accessToken) return cookies.accessToken
  if (socket.handshake.auth?.token) return socket.handshake.auth.token
  return null
}

function authenticateSocket(socket, next) {
  const token = getTokenFromSocket(socket)
  if (!token) return next(new Error('unauthorized'))
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    socket.user = { id: payload.sub, role: payload.role }
    next()
  } catch {
    next(new Error('unauthorized'))
  }
}

module.exports = {
  authenticateSocket,
}

