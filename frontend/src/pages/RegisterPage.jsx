import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "rider",
    licenseNumber: "",
    vehicleType: "car"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return Swal.fire({
        title: "Password Mismatch",
        text: "Password and confirm password do not match",
        icon: "error"
      });
    }

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role
      };

      if (form.role === "driver") {
        payload.licenseNumber = form.licenseNumber;
        payload.vehicleType = form.vehicleType;
      }

      await axios.post("http://localhost:5000/api/auth/register", payload, {
        headers: { "Content-Type": "application/json" }
      });

      Swal.fire({
        title: "Registration Successful",
        text: "Please login to continue",
        icon: "success",
        confirmButtonText: "OK"
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Registration failed";
      Swal.fire({ title: "Error", text: message, icon: "error" });
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="ucab-card card">
          <div className="ucab-card-header card-header">
            <h2 className="ucab-section-title mb-1">Create Account</h2>
            <p className="mb-0 text-muted-sm">Join UCab as a Rider or Driver</p>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit} className="d-grid gap-3">

              {/* Role Selection */}
              <div>
                <label className="form-label fw-bold">I want to join as</label>
                <div className="d-flex gap-3">
                  <div
                    className={`flex-fill text-center p-3 border rounded ${form.role === "rider" ? "border-primary bg-primary text-white" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setForm({ ...form, role: "rider" })}
                  >
                    <div style={{ fontSize: "1.5rem" }}>🧍</div>
                    <strong>Rider</strong>
                  </div>
                  <div
                    className={`flex-fill text-center p-3 border rounded ${form.role === "driver" ? "border-primary bg-primary text-white" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setForm({ ...form, role: "driver" })}
                  >
                    <div style={{ fontSize: "1.5rem" }}>🚗</div>
                    <strong>Driver</strong>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                />
              </div>

              {/* Email */}
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

              {/* Phone */}
              <div>
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>

              {/* Driver-only fields */}
              {form.role === "driver" && (
                <>
                  <div>
                    <label className="form-label">Driving License Number</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      className="form-control"
                      value={form.licenseNumber}
                      onChange={handleChange}
                      required
                      placeholder="Enter license number"
                    />
                  </div>

                  <div>
                    <label className="form-label">Vehicle Type</label>
                    <select
                      name="vehicleType"
                      className="form-select"
                      value={form.vehicleType}
                      onChange={handleChange}
                    >
                      <option value="bike">Bike</option>
                      <option value="auto">Auto</option>
                      <option value="car">Car</option>
                      <option value="suv">SUV</option>
                    </select>
                  </div>
                </>
              )}

              {/* Password */}
              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a password"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter password"
                />
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Register as {form.role === "driver" ? "Driver" : "Rider"}
              </button>

              <p className="text-center text-muted-sm mb-0">
                Already have an account?{" "}
                <span
                  style={{ cursor: "pointer", color: "var(--ucab-primary)" }}
                  onClick={() => navigate("/login")}
                >
                  Login
                </span>
              </p>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
