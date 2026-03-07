import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect } from "react";
import { gsap } from "gsap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BookingsPage from "./pages/BookingsPage";
import DriverRegisterPage from "./pages/DriverRegisterPage";
import DriverVerificationPage from "./pages/DriverVerificationPage";
import SearchCabsPage from "./pages/SearchCabsPage";
import RideTrackingPage from "./pages/RideTrackingPage";
import PaymentPage from "./pages/PaymentPage";
import HistorySupportPage from "./pages/HistorySupportPage";
import DriverDashboardPage from "./pages/DriverDashboardPage";

function App() {

  useEffect(() => {

    gsap.from(".ucab-main", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out"
    });

  }, []);

  const token = localStorage.getItem("ucab_token");
  const currentUser = JSON.parse(localStorage.getItem("ucab_user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("ucab_token");
    localStorage.removeItem("ucab_user");
    window.location.href = "/";
  };

  return (
    <Router>

      <div className="ucab-layout">

        {/* Navbar */}

        <nav className="navbar navbar-expand-lg navbar-dark ucab-nav-blur shadow-sm">

          <div className="container">

            <Link className="navbar-brand fw-bold" to="/">
              🚕 UCab
            </Link>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#ucabNavbar"
            >
              <span className="navbar-toggler-icon" />
            </button>

            <div className="collapse navbar-collapse" id="ucabNavbar">

              <ul className="navbar-nav ms-auto align-items-center">

                {/* Rider-only links */}
                {token && currentUser?.role !== "driver" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/bookings">
                      Book Ride
                    </Link>
                  </li>
                )}

                {/* Driver-only links */}
                {token && currentUser?.role === "driver" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/driver-dashboard">
                      Dashboard
                    </Link>
                  </li>
                )}

                {!token && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/login">
                        Login
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/register">
                        Register
                      </Link>
                    </li>
                  </>
                )}

                {token && (
                  <li className="nav-item">
                    <button className="btn btn-sm btn-danger ms-2" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                )}

              </ul>

            </div>

          </div>

        </nav>

        {/* Main */}

        <main className="ucab-main">

          <div className="container">

            <Routes>

              <Route path="/" element={<HomePage />} />

              <Route path="/login" element={<LoginPage />} />

              <Route path="/register" element={<RegisterPage />} />

              <Route path="/bookings" element={<BookingsPage />} />

              <Route path="/driver/register" element={<DriverRegisterPage />} />

              <Route path="/driver/verify" element={<DriverVerificationPage />} />

              <Route path="/search" element={<SearchCabsPage />} />

              <Route path="/track" element={<RideTrackingPage />} />

              <Route path="/payments" element={<PaymentPage />} />

              <Route path="/history-support" element={<HistorySupportPage />} />
              <Route path="/driver-dashboard" element={<DriverDashboardPage />} />

            </Routes>

          </div>

        </main>

      </div>

    </Router>
  );
}

export default App;