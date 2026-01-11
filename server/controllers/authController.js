const bcrypt = require('bcryptjs')
const { prisma } = require('../config/database')
const { HttpError } = require('../utils/httpError')
const { parseCookies } = require('../middleware/auth')
const { signAccessToken, signRefreshToken, verifyRefreshToken, setAuthCookies } = require('../utils/jwt')

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    address: user.address,
    verified: user.verified,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

async function register(req, res, next) {
  try {
    const { name, email, password, role, address } = req.body
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        address,
      },
    })
    res.status(201).json({ user: sanitizeUser(user) })
  } catch (err) {
    if (err.code === 'P2002') {
      return next(new HttpError({ statusCode: 409, code: 'CONFLICT', error: 'Conflict', message: 'Email already in use' }))
    }
    next(err)
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user) {
      return next(new HttpError({ statusCode: 401, code: 'UNAUTHORIZED', error: 'Unauthorized', message: 'Invalid credentials' }))
    }
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return next(new HttpError({ statusCode: 401, code: 'UNAUTHORIZED', error: 'Unauthorized', message: 'Invalid credentials' }))
    }
    const accessToken = signAccessToken({ userId: user.id, role: user.role })
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role })
    setAuthCookies(res, { accessToken, refreshToken })
    res.json({ user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
}

async function refresh(req, res, next) {
  try {
    const cookies = parseCookies(req.headers.cookie)
    const token = cookies.refreshToken
    if (!token) {
      return next(new HttpError({ statusCode: 401, code: 'UNAUTHORIZED', error: 'Unauthorized', message: 'Missing refresh token' }))
    }
    let payload
    try {
      payload = verifyRefreshToken(token)
    } catch {
      return next(new HttpError({ statusCode: 401, code: 'UNAUTHORIZED', error: 'Unauthorized', message: 'Invalid refresh token' }))
    }
    const userId = payload.sub
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return next(new HttpError({ statusCode: 401, code: 'UNAUTHORIZED', error: 'Unauthorized', message: 'Invalid refresh token' }))
    }
    const accessToken = signAccessToken({ userId: user.id, role: user.role })
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role })
    setAuthCookies(res, { accessToken, refreshToken })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (!user) {
      return next(new HttpError({ statusCode: 404, code: 'NOT_FOUND', error: 'NotFound', message: 'User not found' }))
    }
    res.json({ user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  register,
  login,
  refresh,
  me,
}

