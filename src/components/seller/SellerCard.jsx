import Card from '../common/Card.jsx'
import Badge from '../common/Badge.jsx'
import Avatar from '../common/Avatar.jsx'
import Button from '../common/Button.jsx'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

/**
 * SellerCard Component (Fiverr-style)
 * @param {object} seller - Seller data
 * @param {string} seller.id
 * @param {string} seller.name
 * @param {string} seller.category
 * @param {string} seller.location
 * @param {number} seller.rating
 * @param {boolean} seller.verified
 * @param {number} seller.priceFrom
 * @param {string} seller.bio
 * @param {string} seller.avatar
 */
export default function SellerCard({ seller }) {
  const stars = Array.from({ length: 5 }).map((_, i) => {
    const filled = seller.rating >= i + 1
    const half = !filled && seller.rating >= i + 0.5
    return (
      <span key={i} className="text-yellow-500">
        {filled ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .587l3.668 7.431L23.4 9.748l-5.4 5.259 1.274 7.436L12 18.896l-7.274 3.547L6 15.007.6 9.748l7.732-1.73L12 .587z" />
          </svg>
        ) : half ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`half-${i}`} x1="0" x2="1">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path fill="url(#half-${i})" stroke="currentColor" d="M12 .587l3.668 7.431L23.4 9.748l-5.4 5.259 1.274 7.436L12 18.896l-7.274 3.547L6 15.007.6 9.748l7.732-1.73L12 .587z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 .587l3.668 7.431L23.4 9.748l-5.4 5.259 1.274 7.436L12 18.896l-7.274 3.547L6 15.007.6 9.748l7.732-1.73L12 .587z" />
          </svg>
        )}
      </span>
    )
  })

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2, boxShadow: 'var(--shadow-elevated)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="rounded"
    >
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="p-[2px] rounded-full"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--grad-a), var(--grad-b))' }}
          >
            <Avatar name={seller.name} src={seller.avatar} size={48} className="border-none" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="font-semibold">{seller.name}</div>
              {seller.verified ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 12l2 2 4-4" strokeWidth="2" />
                    <circle cx="12" cy="12" r="9" strokeWidth="2" />
                  </svg>
                  Verified
                </Badge>
              ) : (
                <Badge variant="warning">Unverified</Badge>
              )}
            </div>
            <div className="text-sm text-text/70 flex items-center gap-2 mt-1">
              <Badge variant="info">{seller.category}</Badge>
              <span>• {seller.location ? `${seller.location}, Lagos` : 'Lagos'}</span>
            </div>
            <div className="flex items-center gap-1 mt-2">{stars}<span className="text-xs text-text/70 ml-1">{seller.rating.toFixed(1)}</span></div>
            <div
              className="text-sm mt-2"
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {seller.bio}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm">
                {seller.priceFrom ? (
                  <>
                    From <span className="font-semibold">₦{Number(seller.priceFrom).toLocaleString('en-NG')}</span>
                  </>
                ) : null}
              </div>
              <Link to={`/sellers/${seller.id}`}>
                <Button>View Profile</Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
