import React, { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  const login = (t, u) => { localStorage.setItem('token', t); localStorage.setItem('user', JSON.stringify(u)); setToken(t); setUser(u); };
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setToken(null); setUser(null); };
  return { token, user, login, logout };
}

function AuthForms({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const submit = async (e) => {
    e.preventDefault();
    const url = mode === 'login' ? `${API_URL}/auth/login` : `${API_URL}/auth/register`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Error'); return; }
    if (mode === 'login') onLogin(data.token, data.user);
    else { alert('Registered! Now login.'); setMode('login'); }
  };
  return (
    <div className="max-w-md mx-auto mt-16 bg-white shadow rounded-xl p-6">
      <h1 className="text-2xl font-bold mb-4">{mode === 'login' ? 'Login' : 'Register'}</h1>
      <form onSubmit={submit} className="space-y-3">
        {mode === 'register' && (
          <input className="w-full border rounded p-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        )}
        <input className="w-full border rounded p-2" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        <input className="w-full border rounded p-2" type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
        <button className="w-full bg-black text-white rounded-lg px-4 py-2">{mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <div className="text-sm mt-3 text-center">
        {mode==='login' ? (
          <>No account? <button className="underline" onClick={()=>setMode('register')}>Register</button></>
        ) : (
          <>Have an account? <button className="underline" onClick={()=>setMode('login')}>Login</button></>
        )}
      </div>
    </div>
  )
}

function TaskRow({ t, onSave, onDelete }) {
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState({ ...t });
  return (
    <tr className="border-b">
      <td className="p-2">{edit ? <input className="border p-1" value={draft.title} onChange={e=>setDraft({...draft, title:e.target.value})}/> : t.title}</td>
      <td className="p-2">{edit ? <input className="border p-1" value={draft.description || ''} onChange={e=>setDraft({...draft, description:e.target.value})}/> : (t.description || '')}</td>
      <td className="p-2">{edit ? (
        <select className="border p-1" value={draft.status} onChange={e=>setDraft({...draft, status:e.target.value})}>
          <option>OPEN</option><option>IN_PROGRESS</option><option>BLOCKED</option><option>DONE</option>
        </select>
      ) : t.status}</td>
      <td className="p-2">{new Date(t.createdAt).toLocaleString()}</td>
      <td className="p-2 space-x-2">
        {edit ? (
          <>
            <button className="px-2 py-1 bg-black text-white rounded" onClick={()=>{onSave(draft); setEdit(false);}}>Save</button>
            <button className="px-2 py-1 border rounded" onClick={()=>setEdit(false)}>Cancel</button>
          </>
        ) : (
          <>
            <button className="px-2 py-1 border rounded" onClick={()=>setEdit(true)}>Edit</button>
            <button className="px-2 py-1 border rounded" onClick={()=>onDelete(t.id)}>Delete</button>
          </>
        )}
      </td>
    </tr>
  )
}

export default function App() {
  const { token, user, login, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });

  useEffect(() => {
    if (!token) return;
    (async () => {
      const res = await fetch(`${API_URL}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setTasks(data);
    })();
  }, [token]);

  const createTask = async () => {
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) { setTasks([data, ...tasks]); setForm({ title:'', description:'' }); }
  };

  const saveTask = async (draft) => {
    const res = await fetch(`${API_URL}/tasks/${draft.id}`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(draft)
    });
    const data = await res.json();
    if (res.ok) setTasks(tasks.map(t=>t.id===data.id?data:t));
  };

  const deleteTask = async (id) => {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setTasks(tasks.filter(t=>t.id!==id));
  };

  if (!token) return <AuthForms onLogin={login} />

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user?.name || user?.email}</h1>
        <button className="border px-3 py-1 rounded" onClick={logout}>Logout</button>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h2 className="font-semibold mb-2">Create Task</h2>
        <div className="flex gap-2">
          <input className="border rounded p-2 flex-1" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
          <input className="border rounded p-2 flex-1" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
          <button className="bg-black text-white rounded px-4" onClick={createTask}>Add</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-4">My Tasks</h2>
        <table className="w-full text-left">
          <thead><tr className="text-sm text-gray-500"><th className="p-2">Title</th><th className="p-2">Description</th><th className="p-2">Status</th><th className="p-2">Created</th><th className="p-2">Actions</th></tr></thead>
          <tbody>
            {tasks.map(t=> <TaskRow key={t.id} t={t} onSave={saveTask} onDelete={deleteTask} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
