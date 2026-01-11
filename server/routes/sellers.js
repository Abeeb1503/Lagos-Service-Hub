const express = require('express')
const { requireAuth, requireRole } = require('../middleware/auth')
const { validateBody, validateQuery } = require('../middleware/validate')
const { upload } = require('../middleware/upload')
const {
  createSellerProfileSchema,
  updateSellerProfileSchema,
  listSellersQuerySchema,
} = require('../utils/validators')
const sellersController = require('../controllers/sellersController')
const ratingsController = require('../controllers/ratingsController')
const { sellerRatingSchema } = require('../utils/validators')

const router = express.Router()

router.post('/', requireAuth, requireRole('seller'), validateBody(createSellerProfileSchema), sellersController.createProfile)
router.get('/', validateQuery(listSellersQuerySchema), sellersController.listSellers)
router.post('/portfolio', requireAuth, requireRole('seller'), upload.array('images', 10), sellersController.uploadPortfolio)
router.post('/id-document', requireAuth, requireRole('seller'), upload.single('idDocument'), sellersController.uploadIdDocument)
router.get('/:id', sellersController.getSeller)
router.put('/:id', requireAuth, requireRole('seller'), validateBody(updateSellerProfileSchema), sellersController.updateProfile)
router.post('/:id/rating', requireAuth, requireRole('buyer'), validateBody(sellerRatingSchema), ratingsController.createRating)
router.get('/:id/ratings', ratingsController.listRatings)

module.exports = router
