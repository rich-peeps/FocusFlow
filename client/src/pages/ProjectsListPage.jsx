import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { getProjects, createProject } from '../api'
import PageLayout from '../components/PageLayout'
import TextInput from '../components/TextInput'
import { getProjects, createProject, deleteProject } from '../api'

function ProjectsListPage() {
  const { user, token } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ title: '', description: '' })
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        setError(null)
        const data = await getProjects(token)
        setProjects(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleDeleteProject = async (projectId) => {
  try {
    setError(null)
    await deleteProject(projectId, token)
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
  } catch (err) {
    setError(err.message)
  }
}

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    try {
      setError(null)
      const newProject = await createProject(
        { title: form.title.trim(), description: form.description.trim() },
        token,
      )
      setProjects((prev) => [...prev, newProject])
      setForm({ title: '', description: '' })
    } catch (err) {
      setError(err.message)
    }
  }

  if (!user) {
    return (
      <PageLayout width={600}>
        <h1>Projects</h1>
        <p>You must be logged in to view your projects.</p>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <h1>Your Projects</h1>

      <section style={{ marginTop: '1rem' }}>
        <h2>Create a new project</h2>
        <form onSubmit={handleSubmit} style={{ marginTop: '0.5rem' }}>
          <TextInput
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
          />
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                style={{ display: 'block', width: '100%', padding: '0.4rem' }}
              />
            </label>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">Create Project</button>
        </form>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Existing Projects</h2>
        {loading && <p>Loading projects...</p>}
        {!loading && projects.length === 0 && <p>No projects yet.</p>}
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem' }}>
          {projects.map((p) => (
            <li
              key={p.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '0.75rem',
                marginBottom: '0.5rem',
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/projects/${p.id}`)}
            >
              <div
                style={{ cursor: 'pointer' }}
                onClick={(e) => navigate(`/projects/${p.id}`)}
              >
              <strong>{p.name}</strong>
              {p.description && (
                <p style={{ marginTop: '0.25rem' }}>{p.description}</p>
              )}
              </div>
              <button onClick={() => handleDeleteProject(p.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>
    </PageLayout>
  )
}

export default ProjectsListPage