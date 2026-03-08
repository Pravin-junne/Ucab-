import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);

      const { token, user } = res.data;

      // Save token and user info
      localStorage.setItem('ucab_token', token);
      localStorage.setItem('ucab_user', JSON.stringify(user));

      Swal.fire({
        title: 'Login Successful',
        text: `Welcome back, ${user.name}!`,
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        if (user.role === 'driver') {
          navigate('/driver-dashboard');
        } else {
          navigate('/bookings');
        }
      });

    } catch (error) {
      Swal.fire({
        title: 'Login Failed',
        text: error.response?.data?.message || 'Invalid email or password',
        icon: 'error'
      });
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5 col-lg-4">
        <div className="ucab-card card">
          <div className="ucab-card-header card-header">
            <h2 className="ucab-section-title mb-1">Welcome back</h2>
            <p className="mb-0 text-muted-sm">
              Sign in to continue with UCab.
            </p>
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
                  placeholder="Enter password"
                />
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Login
              </button>

              <p className="text-center text-muted-sm mb-0">
                Don't have an account?{" "}
                <span
                  style={{ cursor: "pointer", color: "var(--ucab-primary)" }}
                  onClick={() => navigate("/register")}
                >
                  Register
                </span>
              </p>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
