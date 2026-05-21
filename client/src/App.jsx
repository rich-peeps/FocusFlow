import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { useAuth } from './auth'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import ProjectsListPage from './pages/ProjectsListPage.jsx'
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'
import TodayPage from './pages/TodayPage.jsx'
import './App.css'

function ProtectedRoute({ element }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main style={{ maxWidth: 800, margin: '2rem auto', padding: '1rem' }}>
        <p>Checking authentication...</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return element
}

function App() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      <nav
        style={{
          padding: '1rem',
          borderBottom: '1px solid #ddd',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <Link to="/projects" style={{ marginRight: '1rem' }}>
            Projects
          </Link>
          <Link to="/today" style={{ marginRight: '1rem' }}>
            Today
          </Link>
        </div>
        <div>
          {!user ? (
            <>
              <Link to="/login" style={{ marginRight: '1rem' }}>
                Login
              </Link>
              <Link to="/signup">Signup</Link>
            </>
          ) : (
            <>
              <span style={{ marginRight: '1rem' }}>Hi, {user.username}</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </nav>

      <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/projects"
        element={<ProtectedRoute element={<ProjectsListPage />} />}
      />
      <Route
        path="/projects/:id"
        element={<ProtectedRoute element={<ProjectDetailPage />} />}
      />
      <Route
        path="/today"
        element={<ProtectedRoute element={<TodayPage />} />}
      />

      {/* default: redirect unknown routes */}
      <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </>
  )
}

export default App