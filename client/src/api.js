const API_BASE_URL = 'http://localhost:5555'  // Flask backend

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const res = await fetch(url, { ...options, headers })

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const message = (data && data.error) || data || res.statusText
    throw new Error(message)
  }

  return data
}

export function signup({ username, email, password }) {
  return request('/api/signup', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  })
}

export function login({ username, password }) {
  return request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function getMe(token) {
  return request('/api/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function getProjects(token) {
  return request('/api/projects', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function createProject({ title, description }, token) {
  return request('/api/projects', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description }),
  })
}

export function getTasks(projectId, token) {
  return request(`/api/projects/${projectId}/tasks`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function createTask(projectId, task, token) {
  return request(`/api/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(task),
  })
}

export function getProject(projectId, token) {
  return request(`/api/projects/${projectId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}