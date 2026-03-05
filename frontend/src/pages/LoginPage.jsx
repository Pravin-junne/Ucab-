import { useState } from 'react';
import axios from 'axios';

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('ucab_token', res.data.token);
      setMessage('Logged in successfully! You can now book rides, make payments and raise support.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5 col-lg-4">
        <div className="ucab-card card">
          <div className="ucab-card-header card-header">
            <h2 className="ucab-section-title mb-1">Welcome back</h2>
            <p className="mb-0 text-muted-sm">Sign in to continue booking rides with Ucab.</p>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="d-grid gap-3">
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Login
              </button>
            </form>
            {message && <p className="mt-3 text-muted-sm">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

