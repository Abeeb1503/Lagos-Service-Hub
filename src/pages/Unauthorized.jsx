import Button from '../components/common/Button.jsx'
import { Link } from 'react-router-dom'

export default function Unauthorized() {
  return (
    <div className="max-w-md mx-auto text-center space-y-4">
      <h1 className="text-2xl font-semibold">Unauthorized</h1>
      <p>You don’t have access to this page with your current role.</p>
      <Link to="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  )
}

