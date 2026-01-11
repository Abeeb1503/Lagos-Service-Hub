const jwt = require('jsonwebtoken')
const { HttpError } = require('../utils/httpError')

function parseCookies(cookieHeader) {
  const out = {}
  if (!cookieHeader) return out
  const parts = cookieHeader.split(';')
  for (const part of parts) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const k = part.slice(0, idx).trim()
    const v = part.slice(idx + 1).trim()
    out[k] = decodeURIComponent(v)
  }
  return out
}

function getTokenFromRequest(req) {
  const auth = req.headers.authorization || ''
  if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim()
  const cookies = parseCookies(req.headers.cookie)
  if (cookies.accessToken) return cookies.accessToken
  return null
}

function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req)
  if (!token) {
    return next(new HttpError({ statusCode: 401, code: 'UNAUTHORIZED', error: 'Unauthorized', message: 'Not authenticated' }))
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.sub, role: payload.role }
    next()
  } catch {
    return next(new HttpError({ statusCode: 401, code: 'UNAUTHORIZED', error: 'Unauthorized', message: 'Invalid token' }))
  }
}

function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles]
  return (req, res, next) => {
    if (!req.user) {
      return next(new HttpError({ statusCode: 401, code: 'UNAUTHORIZED', error: 'Unauthorized', message: 'Not authenticated' }))
    }
    if (!allowed.includes(req.user.role)) {
      return next(new HttpError({ statusCode: 403, code: 'FORBIDDEN', error: 'Forbidden', message: 'Insufficient permissions' }))
    }
    next()
  }
}

module.exports = {
  parseCookies,
  requireAuth,
  requireRole,
}

