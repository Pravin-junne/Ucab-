import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
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

  const token = localStorage.getItem("ucab_token");
  const currentUser = JSON.parse(localStorage.getItem("ucab_user") || "{}");

  return (
    <Router>

      <div className="ucab-layout">

        {/* Navbar */}

        <nav className="navbar navbar-expand navbar-dark ucab-nav-blur shadow-sm">

          <div className="container">

            <Link className="navbar-brand fw-bold" to="/">
              🚕 UCab
            </Link>

            <ul className="navbar-nav ms-auto align-items-center">

              {token && currentUser?.role !== "driver" && (
                <li className="nav-item">
                  <Link className="nav-link" to="/bookings">
                    Book Ride
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

            </ul>

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