const jwt = require('jsonwebtoken')

function signAccessToken({ userId, role }) {
  return jwt.sign({ role }, process.env.JWT_SECRET, { subject: userId, expiresIn: '15m' })
}

function signRefreshToken({ userId, role }) {
  return jwt.sign({ role }, process.env.JWT_REFRESH_SECRET, { subject: userId, expiresIn: '7d' })
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
}

function cookieOptions() {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  }
}

function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie('accessToken', accessToken, { ...cookieOptions(), maxAge: 15 * 60 * 1000 })
  res.cookie('refreshToken', refreshToken, { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 })
}

function clearAuthCookies(res) {
  res.clearCookie('accessToken', { path: '/' })
  res.clearCookie('refreshToken', { path: '/' })
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
}

