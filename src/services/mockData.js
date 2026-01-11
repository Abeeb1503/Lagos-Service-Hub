import { PROFESSIONS, LAGOS_AREAS } from '../utils/constants.js'
const CATEGORIES = PROFESSIONS
const LOCATIONS = LAGOS_AREAS
const NAMES = [
  'Tunde Adewale',
  'Chidinma Okafor',
  'Amina Bello',
  'Chinedu Eze',
  'Busola Ajayi',
  'Ibrahim Lawal',
  'Ngozi Nwachukwu',
  'Segun Balogun',
  'Kemi Adesina',
  'Obinna Nnaji',
  'Funke Adebayo',
  'Yusuf Akinwale',
  'Adaora Nkem',
  'Oluwaseun Danladi',
  'Hauwa Abdullahi',
  'Femi Oduola',
  'Rasheedat Odu',
  'Uche Onyekachi',
  'Bola Alabi',
  'Sade Williams',
  'Sola Ogun',
  'Tosin Oladapo',
  'Damilola Aina',
  'Precious Okeke',
]

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function makeId() {
  return crypto?.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2)
}

function pick(arr) {
  return arr[random(0, arr.length - 1)]
}

function seedSellers() {
  const existing = localStorage.getItem('mock_sellers')
  if (existing) return JSON.parse(existing)
  const sellers = Array.from({ length: 24 }).map((_, i) => {
    const name = NAMES[i % NAMES.length]
    const category = pick(CATEGORIES)
    const location = pick(LOCATIONS)
    const rating = Math.round((Math.random() * 1.5 + 3.5) * 10) / 10
    const priceFrom = random(3000, 25000)
    const verified = Math.random() > 0.35
    const portfolio = Array.from({ length: 6 }).map((__, idx) => `https://picsum.photos/seed/${i}-${idx}/600/400`)
    const testimonials = [
      { name: pick(NAMES), rating: random(4, 5), comment: 'Excellent service, very professional.' },
      { name: pick(NAMES), rating: random(3, 5), comment: 'Good communication and timely delivery.' },
      { name: pick(NAMES), rating: random(4, 5), comment: 'Highly recommended for Lagos jobs.' },
    ]
    return {
      id: makeId(),
      name,
      category,
      location,
      rating,
      verified,
      priceFrom,
      bio: `Experienced ${category.toLowerCase()} specialist serving ${location}, Lagos. Quality work and timely delivery.`,
      avatar: `https://i.pravatar.cc/150?img=${random(1, 70)}`,
      portfolio,
      testimonials,
      skills: ['Fast', 'Reliable', 'Affordable'],
      pricing: [
        { tier: 'Basic', price: priceFrom, desc: 'Entry-level service' },
        { tier: 'Standard', price: priceFrom + random(1000, 5000), desc: 'Standard package' },
        { tier: 'Premium', price: priceFrom + random(6000, 12000), desc: 'Premium package' },
      ],
    }
  })
  localStorage.setItem('mock_sellers', JSON.stringify(sellers))
  return sellers
}

export function getSellers() {
  return seedSellers()
}

export function getSellerById(id) {
  const sellers = seedSellers()
  return sellers.find((s) => s.id === id)
}

export function getTransactionsForSeller(sellerId) {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const txs = Array.from({ length: 12 }).map((_, i) => {
    const amount = random(5000, 50000)
    const commission = Math.round(amount * 0.1)
    const payout = amount - commission
    return {
      id: makeId(),
      sellerId,
      title: `Job #${random(1000, 9999)}`,
      amount,
      commission,
      payout,
      date: `2025-${random(1, 12).toString().padStart(2, '0')}-${random(1, 28).toString().padStart(2, '0')}`,
      status: Math.random() > 0.2 ? 'paid' : 'pending',
      month: months[i % months.length],
    }
  })
  return txs
}

export const CATEGORIES_OPTIONS = CATEGORIES.map((c) => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c }))
export const LOCATIONS_OPTIONS = LOCATIONS.map((l) => ({ value: l.toLowerCase().replace(/\s+/g, '-'), label: l }))

function readJobs() {
  try {
    const raw = localStorage.getItem('mock_jobs')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeJobs(jobs) {
  localStorage.setItem('mock_jobs', JSON.stringify(jobs))
}

function statusToStep(status, released) {
  if (status === 'Proposed') return 1
  if (status === 'Funded') return 2
  if (status === 'In Progress') return 3
  if (status === 'Partial Completed') return 4
  if (status === 'Completed') return released ? 5 : 4
  if (status === 'Disputed') return 3
  return 1
}

function seedJobsForBuyer(buyerId) {
  const sellers = seedSellers()
  const titles = [
    'Fix wiring issue in 3-bedroom flat',
    'Unclog kitchen sink and replace pipes',
    'Full home deep cleaning',
    'Repaint living room and hallway',
    'Build custom wardrobe',
    'Install Wi-Fi and troubleshoot network',
    'Small party catering for 30 guests',
    'Sew 5 Ankara outfits',
    'AC servicing and filter replacement',
    'Tile bathroom floor and walls',
    'Generator maintenance and oil change',
  ]
  const descriptions = [
    'Detailed job requiring experienced professional familiar with Lagos homes.',
    'Please bring necessary tools and provide a clear timeline.',
    'Include materials cost in quote where applicable.',
    'Looking for quality finish and timely delivery.',
  ]
  const statuses = ['Proposed', 'Funded', 'In Progress', 'Partial Completed', 'Completed']
  const jobs = Array.from({ length: 12 }).map((_, i) => {
    const seller = sellers[i % sellers.length]
    const amount = random(5000, 500000)
    const status = statuses[i % statuses.length]
    const created = Date.now() - random(1, 30) * 24 * 60 * 60 * 1000
    const fundedAt = statusToStep(status, false) >= 2 ? created + random(1, 3) * 24 * 60 * 60 * 1000 : null
    const completedAt = statusToStep(status, false) >= 4 ? created + random(4, 15) * 24 * 60 * 60 * 1000 : null
    const satisfactionReports =
      statusToStep(status, false) >= 4
        ? [
            {
              id: makeId(),
              percentage: random(60, 90),
              level: ['Very Satisfied', 'Satisfied'][random(0, 1)],
              comments: 'Work progressing well, satisfied with the quality so far.',
              photos: [],
              date: new Date(created + random(2, 5) * 24 * 60 * 60 * 1000).toISOString(),
            },
          ]
        : []
    return {
      id: makeId(),
      buyerId,
      sellerId: seller.id,
      sellerName: seller.name,
      sellerAvatar: seller.avatar,
      sellerRating: seller.rating,
      sellerCategory: seller.category,
      title: titles[i % titles.length],
      description: descriptions[i % descriptions.length],
      amountTotal: amount,
      depositPercent: 70,
      commissionPercent: 10,
      status,
      createdAt: new Date(created).toISOString(),
      fundedAt: fundedAt ? new Date(fundedAt).toISOString() : null,
      completedAt: completedAt ? new Date(completedAt).toISOString() : null,
      paymentReleased: status === 'Completed' ? Math.random() > 0.5 : false,
      location: pick(LOCATIONS),
      satisfactionReports,
    }
  })
  return jobs
}

export function getJobsForBuyer(buyerId) {
  const jobs = readJobs()
  const mine = jobs.filter((j) => j.buyerId === buyerId)
  if (mine.length > 0) return mine
  const seeded = seedJobsForBuyer(buyerId)
  writeJobs([...jobs, ...seeded])
  return seeded
}

export function getJobById(id) {
  const jobs = readJobs()
  return jobs.find((j) => j.id === id) || null
}

export function createJobRequest({ buyerId, sellerId, title, description, budget, startDate, location, requirements }) {
  const sellers = seedSellers()
  const seller = sellers.find((s) => s.id === sellerId)
  const job = {
    id: makeId(),
    buyerId,
    sellerId,
    sellerName: seller?.name || 'Seller',
    sellerAvatar: seller?.avatar || `https://i.pravatar.cc/150?img=${random(1, 70)}`,
    sellerRating: seller?.rating || 4.5,
    sellerCategory: seller?.category || 'General',
    title: title,
    description: description,
    amountTotal: Number(budget),
    depositPercent: 70,
    commissionPercent: 10,
    status: 'Proposed',
    createdAt: new Date().toISOString(),
    fundedAt: null,
    completedAt: null,
    paymentReleased: false,
    location,
    preferredStartDate: startDate,
    requirements: requirements || '',
    satisfactionReports: [],
  }
  const jobs = readJobs()
  jobs.push(job)
  writeJobs(jobs)
  return job
}

export function payDeposit(jobId) {
  const jobs = readJobs()
  const idx = jobs.findIndex((j) => j.id === jobId)
  if (idx === -1) return null
  jobs[idx].status = 'Funded'
  jobs[idx].fundedAt = new Date().toISOString()
  writeJobs(jobs)
  return jobs[idx]
}

export function submitSatisfactionReport(jobId, report) {
  const jobs = readJobs()
  const idx = jobs.findIndex((j) => j.id === jobId)
  if (idx === -1) return null
  const r = {
    id: makeId(),
    percentage: report.percentage,
    level: report.level,
    comments: report.comments,
    photos: report.photos || [],
    date: new Date().toISOString(),
  }
  jobs[idx].satisfactionReports = [...(jobs[idx].satisfactionReports || []), r]
  if (report.percentage >= 50) {
    jobs[idx].status = 'Partial Completed'
  }
  writeJobs(jobs)
  return r
}

function readAdmin() {
  try {
    const raw = localStorage.getItem('admin_data')
    return raw ? JSON.parse(raw) : { verifications: [], disputes: [], activity: [], finance: {} }
  } catch {
    return { verifications: [], disputes: [], activity: [], finance: {} }
  }
}

function writeAdmin(data) {
  localStorage.setItem('admin_data', JSON.stringify(data))
}

function seedAdmin() {
  const admin = readAdmin()
  if (admin.verifications.length && admin.finance && admin.activity.length) return admin
  const sellers = seedSellers()
  const pendingSellers = sellers.slice(0, 6).map((s, i) => ({
    id: s.id,
    name: s.name,
    avatar: s.avatar,
    category: s.category,
    location: s.location,
    phone: `+23480${random(1000000, 9999999)}`,
    email: `${s.name.toLowerCase().split(' ').join('.')}@example.ng`,
    status: 'pending',
    registeredAt: new Date(Date.now() - random(1, 10) * 24 * 60 * 60 * 1000).toISOString(),
    idDocs: [
      { name: 'NIN.png', url: `https://picsum.photos/seed/id-${i}/600/400` },
      { name: 'DL.png', url: `https://picsum.photos/seed/id2-${i}/600/400` },
    ],
    portfolio: Array.from({ length: 4 }).map((__, k) => `https://picsum.photos/seed/port-${i}-${k}/600/400`),
  }))
  const jobs = readJobs().length ? readJobs() : seedJobsForBuyer(String(Math.random()))
  const escrowQueue = jobs
    .filter((j) => j.status === 'Partial Completed')
    .slice(0, 8)
    .map((j) => ({
      jobId: j.id,
      title: j.title,
      buyerId: j.buyerId,
      sellerId: j.sellerId,
      buyerName: NAMES[random(0, NAMES.length - 1)],
      sellerName: j.sellerName,
      buyerAvatar: `https://i.pravatar.cc/150?img=${random(1, 70)}`,
      sellerAvatar: j.sellerAvatar,
      amountTotal: j.amountTotal,
      deposit: Math.round(j.amountTotal * 0.7),
      commission: Math.round(j.amountTotal * 0.1),
      payout: j.amountTotal - Math.round(j.amountTotal * 0.1),
      status: j.status,
      report: (j.satisfactionReports || [])[0] || null,
      reportedAt: (j.satisfactionReports || [])[0]?.date || new Date().toISOString(),
      flags: [],
      released: false,
    }))
  const disputes = jobs
    .filter((j) => Math.random() > 0.7)
    .slice(0, 3)
    .map((j) => ({
      id: makeId(),
      jobId: j.id,
      title: j.title,
      buyerName: NAMES[random(0, NAMES.length - 1)],
      sellerName: j.sellerName,
      amount: j.amountTotal,
      reason: ['Incomplete Work', 'Quality Issues', 'Payment Issues'][random(0, 2)],
      filedBy: ['Buyer', 'Seller'][random(0, 1)],
      filedAt: new Date(Date.now() - random(1, 7) * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Under Review',
      evidence: [],
      notes: [],
      history: [],
    }))
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const finance = {
    revenueByMonth: months.map((m) => ({ month: m, amount: random(300000, 1500000) })),
    commissionByMonth: months.map((m) => ({ month: m, amount: random(50000, 250000) })),
    categoryBreakdown: CATEGORIES.map((c) => ({ category: c, jobs: random(5, 60) })),
    topSellers: sellers.slice(0, 8).map((s) => ({ name: s.name, revenue: random(100000, 900000) })),
    transactions: Array.from({ length: 50 }).map((_, i) => ({
      id: makeId(),
      date: new Date(Date.now() - random(1, 60) * 24 * 60 * 60 * 1000).toISOString(),
      jobId: jobs[i % jobs.length]?.id || makeId(),
      buyer: NAMES[random(0, NAMES.length - 1)],
      seller: sellers[i % sellers.length].name,
      amount: random(5000, 500000),
      commission: random(500, 50000),
      status: ['CONFIRMED', 'PENDING'][random(0, 1)],
    })),
  }
  const activity = [
    { id: makeId(), text: `New seller registration: ${pendingSellers[0]?.name || 'John Doe'}`, date: new Date().toISOString() },
    { id: makeId(), text: `Escrow release requested: Job #${String(escrowQueue[0]?.jobId || '').slice(-4)}`, date: new Date().toISOString() },
    { id: makeId(), text: `Payment received: ₦${random(50000, 200000).toLocaleString('en-NG')}`, date: new Date().toISOString() },
  ]
  const seeded = { verifications: pendingSellers, escrow: escrowQueue, disputes, finance, activity }
  writeAdmin(seeded)
  return seeded
}

export function getAdminStats() {
  const admin = seedAdmin()
  const pendingVerifications = admin.verifications.filter((v) => v.status === 'pending').length
  const escrowAwaiting = (admin.escrow || []).filter((e) => !e.released && (e.report?.percentage || 0) >= 50).length
  const activeDisputes = (admin.disputes || []).filter((d) => d.status === 'Under Review').length
  const revenueThisMonth = (admin.finance.revenueByMonth || []).slice(-1)[0]?.amount || 0
  const commissionsEarned = (admin.finance.commissionByMonth || []).reduce((s, x) => s + x.amount, 0)
  const sellers = seedSellers()
  const activeSellers = sellers.filter((s) => s.verified).length
  const buyers = readUsers ? (JSON.parse(localStorage.getItem('users') || '[]').filter((u) => u.role === 'buyer').length) : 0
  const jobs = readJobs()
  const totalJobsCompleted = jobs.filter((j) => j.status === 'Completed').length
  return { pendingVerifications, escrowAwaiting, activeDisputes, revenueThisMonth, commissionsEarned, activeSellers, activeBuyers: buyers, totalJobsCompleted }
}

export function getAdminActivity() {
  const admin = seedAdmin()
  return admin.activity
}

export function getVerificationQueue() {
  const admin = seedAdmin()
  return admin.verifications
}

export function approveVerification(sellerId) {
  const admin = seedAdmin()
  admin.verifications = admin.verifications.map((v) => (v.id === sellerId ? { ...v, status: 'approved' } : v))
  writeAdmin(admin)
  const sellers = seedSellers().map((s) => (s.id === sellerId ? { ...s, verified: true } : s))
  localStorage.setItem('mock_sellers', JSON.stringify(sellers))
  return admin.verifications.find((v) => v.id === sellerId)
}

export function rejectVerification(sellerId, reason) {
  const admin = seedAdmin()
  admin.verifications = admin.verifications.map((v) => (v.id === sellerId ? { ...v, status: 'rejected', reason } : v))
  writeAdmin(admin)
  return admin.verifications.find((v) => v.id === sellerId)
}

export function getEscrowQueue() {
  const admin = seedAdmin()
  return admin.escrow || []
}

export function releaseEscrow(jobId) {
  const admin = seedAdmin()
  admin.escrow = (admin.escrow || []).map((e) => (e.jobId === jobId ? { ...e, released: true } : e))
  writeAdmin(admin)
  const jobs = readJobs()
  const idx = jobs.findIndex((j) => j.id === jobId)
  if (idx !== -1) {
    jobs[idx].status = 'Completed'
    jobs[idx].paymentReleased = true
    writeJobs(jobs)
  }
  return admin.escrow.find((e) => e.jobId === jobId)
}

export function flagDispute(jobId, reason) {
  const admin = seedAdmin()
  const dispute = {
    id: makeId(),
    jobId,
    title: getJobById(jobId)?.title || 'Job',
    buyerName: NAMES[random(0, NAMES.length - 1)],
    sellerName: getJobById(jobId)?.sellerName || 'Seller',
    amount: getJobById(jobId)?.amountTotal || 0,
    reason,
    filedBy: 'Admin',
    filedAt: new Date().toISOString(),
    status: 'Under Review',
    evidence: [],
    notes: [],
    history: [],
  }
  admin.disputes = [...(admin.disputes || []), dispute]
  admin.escrow = (admin.escrow || []).map((e) =>
    e.jobId === jobId ? { ...e, flags: Array.from(new Set([...(e.flags || []), 'disputed'])) } : e
  )
  writeAdmin(admin)
  return dispute
}

export function getDisputes() {
  const admin = seedAdmin()
  return admin.disputes || []
}

export function resolveDispute(jobId, action, notes, percent = 50) {
  const admin = seedAdmin()
  admin.disputes = (admin.disputes || []).map((d) =>
    d.jobId === jobId
      ? {
          ...d,
          status: 'Resolved',
          notes: [...(d.notes || []), { date: new Date().toISOString(), text: notes }],
          history: [...(d.history || []), { action, percent, date: new Date().toISOString() }],
        }
      : d
  )
  admin.escrow = (admin.escrow || []).map((e) => {
    if (e.jobId !== jobId) return e
    if (action === 'Partial Refund') {
      const refundPercent = Math.max(0, Math.min(100, Number(percent) || 0))
      const refundAmount = Math.round((e.deposit || 0) * (refundPercent / 100))
      return { ...e, refundPercent, refundAmount, flags: Array.from(new Set([...(e.flags || []), 'refund'])) }
    }
    if (action === 'Full Refund') {
      const refundPercent = 100
      const refundAmount = Math.round(e.deposit || 0)
      return { ...e, refundPercent, refundAmount, flags: Array.from(new Set([...(e.flags || []), 'refund'])) }
    }
    if (action === 'Release to Seller') {
      return { ...e, released: true }
    }
    return e
  })
  writeAdmin(admin)
  return admin.disputes.find((d) => d.jobId === jobId)
}

export function getFinancialData() {
  const admin = seedAdmin()
  return admin.finance
}
