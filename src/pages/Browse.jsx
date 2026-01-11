import Card from '../components/common/Card.jsx'
import Input from '../components/common/Input.jsx'
import Select from '../components/common/Select.jsx'
import { useEffect, useMemo, useState } from 'react'
import SellerCard from '../components/seller/SellerCard.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../services/api.js'
import { PROFESSIONS_OPTIONS, LAGOS_AREAS_OPTIONS } from '../utils/lagos.js'

export default function Browse() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [rating, setRating] = useState('')
  const [priceMax, setPriceMax] = useState(50000)
  const [loading, setLoading] = useState(true)
  const [mobileFilters, setMobileFilters] = useState(false)
  const [sellers, setSellers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    let mounted = true
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', String(pageSize))
    if (query.trim()) params.set('search', query.trim())
    if (category) params.set('category', category)
    if (location) params.set('area', location)
    if (rating) params.set('rating', rating)

    api
      .get(`/api/sellers?${params.toString()}`)
      .then((resp) => {
        if (!mounted) return
        const mapped = (resp.data || []).map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          location: s.address?.area || '',
          rating: Number(s.rating || 0),
          verified: !!s.verified,
          priceFrom: null,
          bio: s.summary,
          avatar: s.avatar,
        }))
        setSellers(mapped)
        setTotal(Number(resp.total || 0))
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [query, category, location, rating, page])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])
  const pageItems = sellers

  useEffect(() => {
    setPage(1)
  }, [query, category, location, rating, priceMax])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search sellers or services"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search sellers"
        />
        <Button variant="secondary" onClick={() => setPage(1)}>
          Search
        </Button>
        <Button variant="outline" className="md:hidden" onClick={() => setMobileFilters((f) => !f)}>
          Filters
        </Button>
      </div>
      <div className="grid md:grid-cols-[260px_1fr] gap-6">
        <aside className="hidden md:block">
          <Card className="p-4 space-y-4">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={PROFESSIONS_OPTIONS}
              placeholder="All categories"
            />
            <Select
              label="Area"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              options={LAGOS_AREAS_OPTIONS}
              placeholder="All areas"
            />
            <Select
              label="Rating"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              options={[
                { value: '', label: 'All ratings' },
                { value: '3', label: '3+ stars' },
                { value: '4', label: '4+ stars' },
                { value: '4.5', label: '4.5+ stars' },
              ]}
            />
            <div>
              <label className="block mb-1 text-sm">Max starting price</label>
              <input
                type="range"
                min={3000}
                max={100000}
                step={1000}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-sm mt-1">₦{priceMax.toLocaleString('en-NG')}</div>
            </div>
            <Button variant="outline" onClick={() => {
              setCategory(''); setLocation(''); setRating(''); setPriceMax(50000); setQuery('')
            }}>
              Clear filters
            </Button>
          </Card>
        </aside>
        <main>
          <AnimatePresence>
            {mobileFilters ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden mb-4"
              >
                <Card className="p-4 space-y-4">
                  <Select
                    label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    options={PROFESSIONS_OPTIONS}
                    placeholder="All categories"
                  />
                  <Select
                    label="Area"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    options={LAGOS_AREAS_OPTIONS}
                    placeholder="All areas"
                  />
                  <Select
                    label="Rating"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    options={[
                      { value: '', label: 'All ratings' },
                      { value: '3', label: '3+ stars' },
                      { value: '4', label: '4+ stars' },
                      { value: '4.5', label: '4.5+ stars' },
                    ]}
                  />
                  <div>
                    <label className="block mb-1 text-sm">Max starting price</label>
                    <input
                      type="range"
                      min={3000}
                      max={100000}
                      step={1000}
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-sm mt-1">₦{priceMax.toLocaleString('en-NG')}</div>
                  </div>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 w-3/5 bg-muted rounded" />
                    <div className="h-4 w-2/5 bg-muted rounded" />
                    <div className="h-24 bg-muted rounded" />
                  </div>
                </Card>
              ))}
            </div>
          ) : pageItems.length === 0 ? (
            <div className="text-center py-10 text-sm">No sellers found, adjust your filters</div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageItems.map((s) => (
                  <SellerCard key={s.id} seller={s} />
                ))}
              </div>
              <div className="flex items-center justify-center gap-3 mt-6">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Previous
                </Button>
                <div className="text-sm">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
