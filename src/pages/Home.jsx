import Greeting from '../components/common/Greeting.jsx'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import Avatar from '../components/common/Avatar.jsx'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Zap,
  Wrench,
  Hammer,
  Scissors,
  ChefHat,
  CalendarDays,
  Paintbrush,
  Palette,
  WashingMachine,
} from 'lucide-react'
const CATEGORIES = [
  { title: 'Electrical Installation / Repairs', Icon: Zap },
  { title: 'Plumbing', Icon: Wrench },
  { title: 'Carpentry', Icon: Hammer },
  { title: 'Fashion Design / Tailoring', Icon: Scissors },
  { title: 'Catering / Baking', Icon: ChefHat },
  { title: 'Event Planning / Decoration', Icon: CalendarDays },
  { title: 'Painting / Decoration', Icon: Paintbrush },
  { title: 'Graphic Design', Icon: Palette },
  { title: 'Laundry / Dry Cleaning', Icon: WashingMachine },
]

export default function Home() {
  const reduce = useReducedMotion()
  const container = {
    hidden: { opacity: 0, y: reduce ? 0 : 8 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: reduce ? 0 : 0.06 } },
  }
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 6 },
    show: { opacity: 1, y: 0 },
  }
  return (
    <div className="space-y-12">
      <section className="container-xl">
        <div className="relative hero-bg rounded-2xl overflow-hidden p-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="bg-card border border-border rounded p-8 shadow-sm">
              <div className="space-y-5">
                <Greeting name="Guest" />
                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl sm:text-4xl font-bold"
                >
                  Find Verified Service Providers in Lagos
                </motion.h1>
                <p className="text-lg">
                  A Lagos-only marketplace connecting verified sellers with buyers. Escrow-protected payments,
                  admin oversight, and trust-first experience.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/browse">
                    <Button>Find a Service</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="secondary">Become a Seller</Button>
                  </Link>
                </div>
                <div className="flex gap-2">
                  <Badge variant="info">Lagos</Badge>
                  <Badge variant="success">Verified</Badge>
                  <Badge variant="warning">Escrow</Badge>
                </div>
              </div>
            </div>
            <motion.div className="animate-float">
              <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className="grid grid-cols-3 gap-4"
              >
                {CATEGORIES.map(({ title, Icon }) => (
                  <motion.div
                    key={title}
                    variants={item}
                    whileHover={{ scale: 1.02, y: -2, boxShadow: 'var(--shadow-elevated)' }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="rounded"
                  >
                    <div
                      className="p-[2px] rounded-lg"
                      style={{ backgroundImage: 'linear-gradient(135deg, var(--grad-a), var(--grad-b))' }}
                    >
                      <Card className="p-4 text-center h-32 flex flex-col items-center justify-center">
                        <Icon className="w-8 h-8 mx-auto text-primary" />
                        <div
                          className="mt-2 font-bold text-base sm:text-lg"
                          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                        >
                          {title}
                        </div>
                      </Card>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="container-xl">
        <motion.h2 initial={{ opacity: 0, y: reduce ? 0 : 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl font-bold mb-4">
          How it works
        </motion.h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid sm:grid-cols-3 gap-4"
        >
          {[
            { title: 'Browse', desc: 'Find verified sellers by category and rating' },
            { title: 'Book', desc: 'Agree scope and timeline with the seller' },
            { title: 'Pay Safely', desc: 'Secure escrow payments released on satisfaction' },
          ].map((step) => (
            <motion.div key={step.title} variants={item}>
              <Card className="p-4">
              <div className="font-semibold text-lg">{step.title}</div>
              <div className="text-sm mt-1">{step.desc}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="container-xl">
        <motion.h2 initial={{ opacity: 0, y: reduce ? 0 : 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl font-bold mb-4">
          Trusted by Lagos
        </motion.h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { k: 'sellers', num: '500+', label: 'Verified Sellers' },
            { k: 'jobs', num: '10,000+', label: 'Jobs Completed' },
            { k: 'escrow', num: 'NGN', label: 'Escrow Protection' },
            { k: 'admin', num: 'Admin', label: 'Oversight & Support' },
          ].map((it) => (
            <motion.div key={it.k} variants={item}>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold">{it.num}</div>
                <div className="text-sm">{it.label}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="container-xl">
        <motion.h2 initial={{ opacity: 0, y: reduce ? 0 : 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl font-bold mb-4">
          Testimonials
        </motion.h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-3 gap-4"
        >
          {[
            { name: 'Amina', text: 'Great electrician! Fast and professional.', role: 'Buyer' },
            { name: 'Chinedu', text: 'Escrow made payments easy and safe.', role: 'Buyer' },
            { name: 'Busola', text: 'Got verified quickly; jobs keep coming.', role: 'Seller' },
          ].map((t, idx) => (
            <motion.div key={idx} variants={item}>
              <Card className="p-4">
              <div className="flex items-center gap-3">
                <Avatar name={t.name} size={36} />
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs">{t.role}</div>
                </div>
              </div>
              <div className="mt-2 text-sm">{t.text}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  )
}
