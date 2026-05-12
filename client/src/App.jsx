import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import ProjectsListPage from './pages/ProjectsListPage.jsx'
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'
import TodayPage from './pages/TodayPage.jsx'
import './App.css'

function App() {
  return (
    <>
      <nav
        style={{
          padding: '1rem',
          borderBottom: '1px solid #ddd',
          marginBottom: '1rem',
        }}
      >
        <Link to="/projects" style={{ marginRight: '1rem' }}>
          Projects
        </Link>
        <Link to="/today" style={{ marginRight: '1rem' }}>
          Today
        </Link>
        <Link to="/login" style={{ marginRight: '1rem' }}>
          Login
        </Link>
        <Link to="/signup">Signup</Link>
      </nav>

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/projects" element={<ProjectsListPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/today" element={<TodayPage />} />
        <Route path="*" element={<ProjectsListPage />} />
      </Routes>
    </>
  )
}

export default App


