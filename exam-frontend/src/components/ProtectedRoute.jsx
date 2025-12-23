import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated (you'll implement this later)
  const isAuthenticated = false

  if (!isAuthenticated) {
    return <Navigate to="/register" replace />
  }

  return children
}

export default ProtectedRoute