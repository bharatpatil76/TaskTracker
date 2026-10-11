import { useEffect, useMemo, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApi, type TaskItem } from './api'
import './App.css'

function App() {
  const { isLoading, isAuthenticated, user, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0()
  const api = useMemo(() => createApi(() => getAccessTokenSilently()),[getAccessTokenSilently])

  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  const load = () =>
    api.getTasks()
      .then((data) => { setTasks(data); setError('') })
      .catch((e) => setError(e.message))

  useEffect(() => { if (isAuthenticated) load() }, [isAuthenticated])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await api.createTask(title.trim())
    setTitle('')
    load()
  }

  const toggle = async (task: TaskItem) => {
    await api.updateTask({ ...task, isDone: !task.isDone })
    load()
  }

  const remove = async (id: number) => {
    await api.deleteTask(id)
    load()
  }

  if (isLoading) return <main><p>Loading...</p></main>

  if (!isAuthenticated)
    return (
      <main>
        <h1>TaskTracker</h1>
        <button onClick={() => loginWithRedirect()}>Log in</button>
      </main>
    )

  return (
    <main>
      <h1>TaskTracker</h1>
      <p>
        Logged in as <b>{user?.email}</b>{' '}
        <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
          Log out
        </button>
      </p>

      <form onSubmit={add}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New task..." />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">Could not reach the API: {error}</p>}

      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            <label className={t.isDone ? 'done' : ''}>
              <input type="checkbox" checked={t.isDone} onChange={() => toggle(t)} />
              {t.title}
            </label>
            <button onClick={() => remove(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
