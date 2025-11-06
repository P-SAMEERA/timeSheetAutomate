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

  // check login status on reload
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    const role = localStorage.getItem('role')
    if (userId && role) {
      setLoggedIn(true)
    } else {
      setLoggedIn(false)
    }
  }, [])

  return (
    <>
      <Routes>
        {/* Login route */}
        <Route
          path="/"
          element={
            loggedIn ? <Navigate to="/dashboard" /> : <Login setLoggedIn={setLoggedIn} />
          }
        />

        {/* Protected Routes */}
        {loggedIn && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/edit" element={<EditSheets />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
          </>
        )}

        {/* Redirect any unknown route */}
        <Route path="*" element={<Navigate to={loggedIn ? '/dashboard' : '/'} />} />
      </Routes>
    </>
  )
}

export default App
