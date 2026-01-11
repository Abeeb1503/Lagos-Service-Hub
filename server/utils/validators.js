const Joi = require('joi')
const { LAGOS_AREAS, PROFESSIONS } = require('./constants')

const passwordSchema = Joi.string()
  .min(8)
  .pattern(/[a-z]/)
  .pattern(/[A-Z]/)
  .pattern(/[0-9]/)
  .pattern(/[^a-zA-Z0-9]/)
  .required()

const addressSchema = Joi.object({
  city: Joi.string().allow('', null),
  state: Joi.string().allow('', null),
  area: Joi.string().valid(...LAGOS_AREAS).required(),
})
  .required()
  .custom((value, helpers) => {
    const city = (value.city || '').toString()
    const state = (value.state || '').toString()
    if (city.toLowerCase().includes('lagos') || state.toLowerCase().includes('lagos')) return value
    return helpers.error('any.custom', { message: 'Address must be within Lagos' })
  }, 'Lagos-only validation')

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
})

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  password: passwordSchema,
  role: Joi.string().valid('buyer', 'seller').required(),
  address: addressSchema,
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

const updateMeSchema = Joi.object({
  name: Joi.string().min(2).max(120),
  address: addressSchema,
}).min(1)

const createSellerProfileSchema = Joi.object({
  category: Joi.string().valid(...PROFESSIONS).required(),
  summary: Joi.string().min(10).max(1000).required(),
})

const updateSellerProfileSchema = Joi.object({
  category: Joi.string().valid(...PROFESSIONS),
  summary: Joi.string().min(10).max(1000),
}).min(1)

const listSellersQuerySchema = paginationSchema.keys({
  category: Joi.string().valid(...PROFESSIONS),
  area: Joi.string().valid(...LAGOS_AREAS),
  rating: Joi.number().min(0).max(5),
  search: Joi.string().max(120).allow(''),
})

const createJobSchema = Joi.object({
  sellerId: Joi.string().uuid().required(),
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(20).max(5000).required(),
  agreedAmount: Joi.number().positive().required(),
})

const listJobsQuerySchema = Joi.object({
  status: Joi.string().valid(
    'proposed',
    'funded',
    'in_progress',
    'partial_completed',
    'completed',
    'disputed',
    'cancelled'
  ),
})

const updateJobStatusSchema = Joi.object({
  status: Joi.string()
    .valid('proposed', 'funded', 'in_progress', 'partial_completed', 'completed', 'disputed', 'cancelled')
    .required(),
})

const satisfactionSchema = Joi.object({
  percentage: Joi.number().min(50).max(100).required(),
  comments: Joi.string().min(5).max(4000).required(),
})

const sellerRatingSchema = Joi.object({
  jobId: Joi.string().uuid().required(),
  stars: Joi.number().integer().min(1).max(5).required(),
  review: Joi.string().min(2).max(2000).required(),
})

module.exports = {
  registerSchema,
  loginSchema,
  updateMeSchema,
  createSellerProfileSchema,
  updateSellerProfileSchema,
  listSellersQuerySchema,
  createJobSchema,
  listJobsQuerySchema,
  updateJobStatusSchema,
  satisfactionSchema,
  sellerRatingSchema,
}

