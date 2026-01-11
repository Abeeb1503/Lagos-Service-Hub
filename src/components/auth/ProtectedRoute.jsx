import { useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  useEffect(() => {}, [user, loading])

  if (loading) {
    return <div className="text-center py-10">Checking access…</div>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

