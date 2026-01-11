function stripHtml(input) {
  return String(input || '').replace(/<[^>]*>/g, '')
}

function sanitizeText(input, { maxLen } = {}) {
  const s = stripHtml(input).trim()
  if (maxLen && s.length > maxLen) return s.slice(0, maxLen)
  return s
}

module.exports = {
  sanitizeText,
}

