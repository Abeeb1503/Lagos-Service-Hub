const express = require('express')
const { requireAuth, requireRole } = require('../middleware/auth')
const { validateBody, validateQuery } = require('../middleware/validate')
const { createJobSchema, listJobsQuerySchema, updateJobStatusSchema, satisfactionSchema } = require('../utils/validators')
const { upload } = require('../middleware/upload')
const jobsController = require('../controllers/jobsController')

const router = express.Router()

router.post('/', requireAuth, requireRole('buyer'), validateBody(createJobSchema), jobsController.createJob)
router.get('/', requireAuth, validateQuery(listJobsQuerySchema), jobsController.listJobs)
router.get('/:id', requireAuth, jobsController.getJob)
router.patch('/:id/status', requireAuth, validateBody(updateJobStatusSchema), jobsController.updateStatus)
router.post(
  '/:id/satisfaction',
  requireAuth,
  requireRole('buyer'),
  upload.array('photos', 5),
  validateBody(satisfactionSchema),
  jobsController.submitSatisfaction
)

module.exports = router
