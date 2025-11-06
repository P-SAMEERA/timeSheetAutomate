import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard'
import EditSheets from './pages/EditSheets'
import Profile from './pages/Profile'
import Login from './pages/login'
import Admin from './pages/Admin'

function App() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    const role = localStorage.getItem('role')
    setLoggedIn(!!(userId && role))
  }, [])

  // watch for manual clear or other changes
  useEffect(() => {
    const handleStorageChange = () => {
      const userId = localStorage.getItem('userId')
      const role = localStorage.getItem('role')
      setLoggedIn(!!(userId && role))
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <Routes>
      <Route
        path="/"
        element={
          loggedIn ? (
            <Navigate to="/dashboard" />
          ) : (
            <Login setLoggedIn={setLoggedIn} />
          )
        }
      />

      {loggedIn && (
        <>
          <Route path="/dashboard" element={<Dashboard setLoggedIn={setLoggedIn} />} />
          <Route path="/edit" element={<EditSheets />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </>
      )}

      <Route path="*" element={<Navigate to={loggedIn ? '/dashboard' : '/'} />} />
    </Routes>
  )
}

export default App
