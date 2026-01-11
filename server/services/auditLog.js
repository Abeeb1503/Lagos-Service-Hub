const { prisma } = require('../config/database')

async function writeAuditLog({ action, userId, adminId, jobId, details }) {
  return prisma.auditLog.create({
    data: {
      action,
      userId: userId || null,
      adminId: adminId || null,
      jobId: jobId || null,
      details: details || {},
    },
  })
}

module.exports = {
  writeAuditLog,
}

