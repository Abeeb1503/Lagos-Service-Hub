import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import Avatar from '../components/common/Avatar.jsx'
import Button from '../components/common/Button.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '../components/common/Modal.jsx'
import JobRequest from '../components/buyer/JobRequest.jsx'
import { api } from '../services/api.js'

export default function SellerProfilePage() {
  const { id } = useParams()
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)
  const [idx, setIdx] = useState(0)
  const [openRequest, setOpenRequest] = useState(false)

  useEffect(() => {
    setLoading(true)
    let mounted = true
    api
      .get(`/api/sellers/${id}`)
      .then((resp) => {
        if (mounted) setSeller(resp.seller || null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return <div className="container-xl py-10 text-center">Loading seller profile…</div>
  }
  if (!seller) {
    return <div className="container-xl py-10 text-center">Seller not found</div>
  }

  const stars = Array.from({ length: 5 }).map((_, i) => (
    <span key={i} className="text-yellow-500">
      {seller.rating >= i + 1 ? (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .587l3.668 7.431L23.4 9.748l-5.4 5.259 1.274 7.436L12 18.896l-7.274 3.547L6 15.007.6 9.748l7.732-1.73L12 .587z" />
        </svg>
      ) : seller.rating >= i + 0.5 ? (
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <defs>
            <linearGradient id={`half-p-${i}`} x1="0" x2="1">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half-p-${i})" stroke="currentColor" d="M12 .587l3.668 7.431L23.4 9.748l-5.4 5.259 1.274 7.436L12 18.896l-7.274 3.547L6 15.007.6 9.748l7.732-1.73L12 .587z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 .587l3.668 7.431L23.4 9.748l-5.4 5.259 1.274 7.436L12 18.896l-7.274 3.547L6 15.007.6 9.748l7.732-1.73L12 .587z" />
        </svg>
      )}
    </span>
  ))

  function next() {
    setIdx((i) => (i + 1) % (seller.portfolioImages?.length || 1))
  }
  function prev() {
    setIdx((i) => (i - 1 + (seller.portfolioImages?.length || 1)) % (seller.portfolioImages?.length || 1))
  }

  return (
    <div className="container-xl space-y-8">
      <section className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Avatar src={seller.avatar} name={seller.name} size={80} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{seller.name}</h1>
                {seller.verified ? <Badge variant="success">Verified</Badge> : <Badge variant="warning">Unverified</Badge>}
              </div>
              <div className="text-sm mt-1 font-semibold">
                <Badge variant="info">{seller.category}</Badge> • {seller.address?.area || 'Lagos'}, Lagos
              </div>
              <div className="flex items-center gap-1 mt-2">
                {stars}
                <span className="text-xs text-text/70 ml-1">{Number(seller.rating || 0).toFixed(1)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm leading-relaxed">
            {seller.summary}
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <Button className="font-semibold" onClick={() => setOpenRequest(true)}>Contact Seller</Button>
              <Button variant="secondary" className="font-semibold" onClick={() => setOpenRequest(true)}>Request Job</Button>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-lg">Portfolio</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={prev}>Prev</Button>
              <Button variant="outline" onClick={next}>Next</Button>
            </div>
          </div>
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.img
                key={idx}
                src={seller.portfolioImages?.[idx]}
                alt={`Portfolio ${idx + 1}`}
                className="w-full h-[280px] object-cover rounded"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              />
            </AnimatePresence>
            <div className="flex items-center justify-center gap-1 mt-2">
              {(seller.portfolioImages || []).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full ${i === idx ? 'bg-primary' : 'bg-border'}`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </Card>
      </section>
      {openRequest ? (
        <Modal open={openRequest} onClose={() => setOpenRequest(false)} title="Send Job Request">
          <JobRequest seller={seller} onSent={() => setOpenRequest(false)} />
        </Modal>
      ) : null}

      <section className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="font-semibold mb-3">Testimonials</div>
          <div className="space-y-3">
            {(seller.testimonials || []).map((t) => (
              <div key={t.id || t.createdAt} className="border border-border rounded p-3">
                <div className="flex items-center gap-2">
                  <Avatar name={t.buyerName || 'Buyer'} size={28} />
                  <div className="text-sm font-medium">{t.buyerName || 'Buyer'}</div>
                  <div className="text-yellow-500 text-xs">{'★'.repeat(Number(t.stars || 0))}</div>
                </div>
                <div className="mt-1 text-sm">{t.review}</div>
              </div>
            ))}
            {(seller.testimonials || []).length === 0 ? <div className="text-sm text-text/70">No reviews yet</div> : null}
          </div>
        </Card>
        <Card className="p-6">
          <div className="font-semibold mb-3">Portfolio</div>
          <div className="grid grid-cols-2 gap-3">
            {(seller.portfolioImages || []).slice(0, 4).map((img) => (
              <img key={img} src={img} alt="Portfolio" className="w-full h-28 object-cover rounded border border-border" />
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
