import { motion } from 'framer-motion'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Greeting({ name = 'Guest', className = '' }) {
  const text = `${getGreeting()} ${name}`
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`text-2xl sm:text-3xl font-semibold ${className}`}
    >
      {text}
    </motion.div>
  )
}

