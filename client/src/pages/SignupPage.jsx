import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import TextInput from '../components/TextInput'
import AuthFormLayout from '../components/AuthFormLayout'

function SignupPage() {
  const { signup, error, setError } = useAuth()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  })
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
      await signup(form)
      navigate('/projects')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFormLayout
      title="Sign Up"
      onSubmit={handleSubmit}
      error={error}
      loading={loading}
      buttonLabel={loading ? 'Creating account...' : 'Sign Up'}
    >
      <TextInput
        label="Username"
        name="username"
        value={form.username}
        onChange={handleChange}
      />
      <TextInput
        label="Email"
        name="email"
        type="email"
        value={form.email}
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

export default SignupPage