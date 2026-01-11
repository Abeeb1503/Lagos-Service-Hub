const express = require('express')
const { requireAuth } = require('../middleware/auth')
const { validateBody } = require('../middleware/validate')
const { updateMeSchema } = require('../utils/validators')
const { upload } = require('../middleware/upload')
const usersController = require('../controllers/usersController')

const router = express.Router()

router.get('/me', requireAuth, usersController.getMe)
router.patch('/me', requireAuth, validateBody(updateMeSchema), usersController.updateMe)
router.post('/avatar', requireAuth, upload.single('avatar'), usersController.uploadAvatar)

module.exports = router
