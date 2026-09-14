import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const defaultTask = {
  title: '',
  description: '',
};

function App() {
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('taskflow-user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('taskflow-token') || '');
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState(defaultTask);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const api = useMemo(
    () =>
      axios.create({
        baseURL: API_URL,
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json',
        },
      }),
    [token],
  );

  const saveAuthData = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem('taskflow-user', JSON.stringify(nextUser));
    localStorage.setItem('taskflow-token', nextToken);
  };

  const clearAuthData = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('taskflow-user');
    localStorage.removeItem('taskflow-token');
  };

  const fetchTasks = async () => {
    if (!token) return;
    try {
      const { data } = await api.get('/tasks');
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load tasks');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const payload = authMode === 'login'
        ? { email: authForm.email, password: authForm.password }
        : authForm;

      const { data } = await api.post(endpoint, payload);
      saveAuthData(data.user, data.token);
      setAuthForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingTaskId) {
        await api.put(`/tasks/${editingTaskId}`, taskForm);
      } else {
        await api.post('/tasks', taskForm);
      }
      setTaskForm(defaultTask);
      setEditingTaskId(null);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Task action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTaskId(task.id);
    setTaskForm({ title: task.title, description: task.description });
  };

  const handleDelete = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const logout = () => {
    clearAuthData();
    setTasks([]);
    setTaskForm(defaultTask);
    setEditingTaskId(null);
  };

  if (!user || !token) {
    return (
      <div className="app-shell auth-shell">
        <div className="auth-card">
          <div className="auth-header">
            <h1>TaskFlow</h1>
            <div className="toggle-group">
              <button
                type="button"
                className={authMode === 'login' ? 'toggle active' : 'toggle'}
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={authMode === 'register' ? 'toggle active' : 'toggle'}
                onClick={() => setAuthMode('register')}
              >
                Register
              </button>
            </div>
          </div>

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {authMode === 'register' && (
              <label>
                Full name
                <input
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  placeholder="Jane Doe"
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                placeholder="jane@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                placeholder="••••••••"
              />
            </label>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell dashboard-shell">
      <aside className="sidebar">
        <div>
          <h2>TaskFlow</h2>
          <p>Welcome, {user.name || user.email}</p>
        </div>
        <button type="button" className="secondary-btn" onClick={logout}>Logout</button>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h3>Tasks</h3>
          </div>
          <div className="stats">
            <span>{tasks.length} tasks</span>
          </div>
        </header>

        <section className="panel">
          <h4>{editingTaskId ? 'Edit task' : 'Create task'}</h4>
          <form onSubmit={handleTaskSubmit} className="task-form">
            <input
              type="text"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="Task title"
            />
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Describe the task"
            />
            <div className="task-actions">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Saving...' : editingTaskId ? 'Update task' : 'Add task'}
              </button>
              {editingTaskId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setEditingTaskId(null);
                    setTaskForm(defaultTask);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          {error && <p className="error-text">{error}</p>}
        </section>

        <section className="panel">
          <h4>Task list</h4>
          <div className="task-list">
            {tasks.length === 0 ? (
              <p className="empty-state">No tasks yet. Add one to get started.</p>
            ) : (
              tasks.map((task) => (
                <article key={task.id} className="task-item">
                  <div>
                    <h5>{task.title}</h5>
                    <p>{task.description}</p>
                  </div>
                  <div className="task-actions">
                    <button type="button" className="secondary-btn" onClick={() => handleEdit(task)}>Edit</button>
                    <button type="button" className="danger-btn" onClick={() => handleDelete(task.id)}>Delete</button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
