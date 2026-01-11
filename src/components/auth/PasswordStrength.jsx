import { passwordChecks } from '../../utils/validation.js'

export default function PasswordStrength({ value = '' }) {
  const { checks, level } = passwordChecks(value)
  const percent = Math.min(100, (Object.values(checks).filter(Boolean).length / 5) * 100)
  const color =
    level === 'strong' ? 'bg-primary' : level === 'medium' ? 'bg-secondary' : 'bg-danger'

  return (
    <div className="space-y-2">
      <div className="h-2 bg-muted rounded overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
      <ul className="text-sm grid grid-cols-2 gap-y-1">
        <li className={checks.length ? 'text-primary' : 'text-danger'}>✓ At least 8 characters</li>
        <li className={checks.upper ? 'text-primary' : 'text-danger'}>✓ Contains uppercase letter</li>
        <li className={checks.lower ? 'text-primary' : 'text-danger'}>✓ Contains lowercase letter</li>
        <li className={checks.number ? 'text-primary' : 'text-danger'}>✓ Contains number</li>
        <li className={checks.symbol ? 'text-primary' : 'text-danger'}>✓ Contains special character</li>
      </ul>
    </div>
  )
}

