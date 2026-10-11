const API_URL = import.meta.env.VITE_API_URL

export type TaskItem = {
  id: number
  title: string
  isDone: boolean
  createdAt: string
}

export function createApi(getToken: () => Promise<string | undefined>) {
  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await getToken()
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    return res.status === 204 ? (undefined as T) : res.json()
  }

  return {
    getTasks: () => request<TaskItem[]>('/api/tasks'),
    createTask: (title: string) =>
      request<TaskItem>('/api/tasks', { method: 'POST', body: JSON.stringify({ title }) }),
    updateTask: (task: TaskItem) =>
      request<void>(`/api/tasks/${task.id}`, { method: 'PUT', body: JSON.stringify(task) }),
    deleteTask: (id: number) =>
      request<void>(`/api/tasks/${id}`, { method: 'DELETE' }),
  }
}
