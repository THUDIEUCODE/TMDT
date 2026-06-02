import { Navigate, useLocation } from 'react-router-dom'
import {
  getCurrentUserRole,
  getDefaultPathForRole,
  isLoggedIn,
  normalizeUserRole,
} from '../../utils/authStorage'

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation()

  if (!isLoggedIn()) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  const currentRole = getCurrentUserRole()
  const normalizedAllowedRoles = allowedRoles.map(normalizeUserRole).filter(Boolean)

  if (normalizedAllowedRoles.length && !normalizedAllowedRoles.includes(currentRole)) {
    const fallbackPath = currentRole ? getDefaultPathForRole(currentRole) : '/unauthorized'
    const nextPath = fallbackPath === location.pathname ? '/unauthorized' : fallbackPath
    return <Navigate to={nextPath} replace />
  }

  return children
}

export default ProtectedRoute
