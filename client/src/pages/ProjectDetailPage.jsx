import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../auth'
import { getProject, getTasks, createTask } from '../api'
import { updateTask } from '../api'  // make sure this is exported in api.js

const handleTaskStatusToggle = async (task) => {
  const newStatus = task.status === 'done' ? 'todo' : 'done'
  try {
    const updated = await updateTask(task.id, { status: newStatus }, token)
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
  } catch (err) {
    setError(err.message)
  }
}

const handleTaskTodayToggle = async (task) => {
  try {
    const updated = await updateTask(
      task.id,
      { today_focus: !task.today_focus },
      token,
    )
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
  } catch (err) {
    setError(err.message)
  }
}

function ProjectDetailPage() {
  const { id } = useParams()
  const projectId = Number(id)
  const { user, token } = useAuth()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    today_focus: false,
    status: 'todo',
    priority: 'medium',
  })

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    async function load() {
      try {
        setError(null)
        const [proj, taskList] = await Promise.all([
          getProject(projectId, token),
          getTasks(projectId, token),
        ])
        setProject(proj)
        setTasks(taskList)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [projectId, token])

  const handleTaskChange = (e) => {
    const { name, type, checked, value } = e.target
    setTaskForm({
      ...taskForm,
      [name]: type === 'checkbox' ? checked : value,
    })
    if (error) setError(null)
  }

  const handleTaskSubmit = async (e) => {
    e.preventDefault()
    if (!taskForm.title.trim()) return
    try {
      const newTask = await createTask(
        projectId,
        {
          title: taskForm.title.trim(),
          description: taskForm.description.trim(),
          today_focus: taskForm.today_focus,
          status: taskForm.status,
          priority: taskForm.priority,
        },
        token,
      )
      setTasks((prev) => [...prev, newTask])
      setTaskForm({ 
        title: '',
        description: '',
        today_focus: false,
        status: 'todo',
        priority: 'medium',
      })
    } catch (err) {
      setError(err.message)
    }
  }

  if (!user) {
    return (
      <main style={{ maxWidth: 800, margin: '2rem auto', padding: '1rem' }}>
        <h1>Project</h1>
        <p>You must be logged in to view this project.</p>
      </main>
    )
  }

  if (loading) {
    return (
      <main style={{ maxWidth: 800, margin: '2rem auto', padding: '1rem' }}>
        <p>Loading project...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main style={{ maxWidth: 800, margin: '2rem auto', padding: '1rem' }}>
        <h1>Project</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </main>
    )
  }

  if (!project) {
    return (
      <main style={{ maxWidth: 800, margin: '2rem auto', padding: '1rem' }}>
        <h1>Project not found</h1>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 800, margin: '2rem auto', padding: '1rem' }}>
      <h1>{project.name}</h1>
      {project.description && (
        <p style={{ marginTop: '0.5rem' }}>{project.description}</p>
      )}

      <section style={{ marginTop: '2rem' }}>
        <h2>Add Task</h2>
        <form onSubmit={handleTaskSubmit} style={{ marginTop: '0.5rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Title
              <input
                type="text"
                name="title"
                value={taskForm.title}
                onChange={handleTaskChange}
                style={{ display: 'block', width: '100%', padding: '0.4rem' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Description
              <textarea
                name="description"
                value={taskForm.description}
                onChange={handleTaskChange}
                style={{ display: 'block', width: '100%', padding: '0.4rem' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              <input
                type="checkbox"
                name="today_focus"
                checked={taskForm.today_focus}
                onChange={handleTaskChange}
                style={{ marginRight: '0.25rem' }}
              />
              Add to Today&apos;s Focus
            </label>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Status
              <select
                name="status"
                value={taskForm.status}
                onChange={handleTaskChange}
                style={{ display: 'block', width: '100%', padding: '0.4rem' }}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Priority
              <select
                name="priority"
                value={taskForm.priority}
                onChange={handleTaskChange}
                style={{ display: 'block', width: '100%', padding: '0.4rem' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">Create Task</button>
        </form>
      </section>
      <section style={{ marginTop: '2rem' }}>
        <h2>Tasks</h2>
        {tasks.length === 0 && <p>No tasks yet.</p>}
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem' }}>
          {tasks.map((t) => (
            <li
              key={t.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '0.75rem',
                marginBottom: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong
                  style={{
                    textDecoration: t.status === 'done' ? 'line-through' : 'none',
                  }}
                >
                  {t.title}
                </strong>
                {t.description && (
                  <p style={{ marginTop: '0.25rem' }}>{t.description}</p>
                )}
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>
                  Status: {t.status} | Today: {t.today_focus ? 'Yes' : 'No'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleTaskStatusToggle(t)}>
                  {t.status === 'done' ? 'Mark ToDo' : 'Mark Done'}
                </button>
                <button onClick={() => handleTaskTodayToggle(t)}>
                  {t.today_focus ? 'Remove from Today' : 'Add to Today'}
                </button>
              </div>
              <strong>{t.title}</strong>
              {t.description && (
                <p style={{ marginTop: '0.25rem' }}>{t.description}</p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default ProjectDetailPage