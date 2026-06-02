import { Navigate, useLocation } from 'react-router-dom'
import { isLoggedIn } from '../../utils/authStorage'

function ProtectedRoute({ children }) {
  const location = useLocation()

  if (!isLoggedIn()) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  return children
}

export default ProtectedRoute
