import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth'
import { getTodayTasks, updateTask } from '../api'
import PageLayout from '../components/PageLayout'

function TodayPage() {
  const { user, token } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    async function load() {
      try {
        setError(null)
        const data = await getTodayTasks(token)
        setTasks(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const handleToggleToday = async (task) => {
    try {
      const updated = await updateTask(
        task.id,
        { today_focus: !task.today_focus },
        token,
      )
      setTasks((prev) =>
        prev
          .map((t) => (t.id === task.id ? updated : t))
          .filter((t) => t.today_focus),
      )
    } catch (err) {
      setError(err.message)
    }
  }

  const handleToggleDone = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    try {
      const updated = await updateTask(task.id, { status: newStatus }, token)
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
    } catch (err) {
      setError(err.message)
    }
  }

  if (!user) {
    return (
      <PageLayout>
        <h1>Today</h1>
        <p>You must be logged in to view your focus tasks.</p>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <h1>Today&apos;s Focus</h1>

      {loading && <p>Loading today&apos;s tasks...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && tasks.length === 0 && !error && (
        <p>No tasks marked for today. You can flag tasks from project pages.</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '0.75rem',
              marginBottom: '0.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong
                  style={{
                    textDecoration:
                      task.status === 'done' ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
                </strong>
                {task.description && (
                  <p style={{ marginTop: '0.25rem' }}>{task.description}</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleToggleDone(task)}>
                  {task.status === 'done' ? 'Mark Todo' : 'Mark Done'}
                </button>
                <button onClick={() => handleToggleToday(task)}>
                  Remove from Today
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </PageLayout>
  )
}

export default TodayPage