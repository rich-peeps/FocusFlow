import React, { createContext, useContext, useEffect, useState } from 'react'
import { login as apiLogin, signup as apiSignup, getMe } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(!!localStorage.getItem('token'))
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchUser() {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const me = await getMe(token)
        setUser(me)
      } catch (err) {
        console.error(err)
        setToken(null)
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [token])

  const handleLogin = async (credentials) => {
    setError(null)
    const data = await apiLogin(credentials)
    setToken(data.access_token)
    localStorage.setItem('token', data.access_token)
    setUser(data.user)
    return data.user
  }

  const handleSignup = async (details) => {
    setError(null)
    const data = await apiSignup(details)
    setToken(data.access_token)
    localStorage.setItem('token', data.access_token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  const value = {
    user,
    token,
    loading,
    error,
    login: handleLogin,
    signup: handleSignup,
    logout,
    setError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}