import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute({ requireAdmin = false }) {
  const token = localStorage.getItem('token')
  const storedUser = localStorage.getItem('currentUser')
  
  let user = null
  if (storedUser) {
    try {
      user = JSON.parse(storedUser)
    } catch (e) {
      user = null
    }
  }

  // If no token or no user, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  // If admin is required but user is not an admin, redirect to profile
  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/profile" replace />
  }

  return <Outlet />
}
