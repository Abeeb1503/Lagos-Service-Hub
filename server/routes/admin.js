const express = require('express')
const { requireAuth, requireRole } = require('../middleware/auth')
const verifications = require('../controllers/admin/verificationsController')
const escrow = require('../controllers/admin/escrowController')
const disputes = require('../controllers/admin/disputesController')
const reports = require('../controllers/admin/reportsController')

const router = express.Router()

router.use(requireAuth, requireRole('admin'))

router.get('/verifications', verifications.listPending)
router.post('/verifications/:sellerId/approve', verifications.approve)
router.post('/verifications/:sellerId/reject', verifications.reject)

router.get('/escrow', escrow.listQueue)
router.post('/escrow/:jobId/release', escrow.release)

router.get('/disputes', disputes.listDisputes)
router.post('/disputes/:jobId/resolve', disputes.resolve)

router.get('/reports', reports.getReports)

module.exports = router

