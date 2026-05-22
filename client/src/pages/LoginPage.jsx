import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import TextInput from '../components/TextInput'
import AuthFormLayout from '../components/AuthFormLayout'

function LoginPage() {
  const { login, error, setError } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form)
      navigate('/projects')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFormLayout
      title="Login"
      onSubmit={handleSubmit}
      error={error}
      loading={loading}
      buttonLabel={loading ? 'Logging in...' : 'Login'}
    >
      <TextInput
        label="Username"
        name="username"
        value={form.username}
        onChange={handleChange}
      />
      <TextInput
        label="Password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
      />
    </AuthFormLayout>
  )
}

export default LoginPage