import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookingsPage from './pages/BookingsPage';
import DriverRegisterPage from './pages/DriverRegisterPage';
import DriverVerificationPage from './pages/DriverVerificationPage';
import SearchCabsPage from './pages/SearchCabsPage';
import RideTrackingPage from './pages/RideTrackingPage';
import PaymentPage from './pages/PaymentPage';
import HistorySupportPage from './pages/HistorySupportPage';

function App() {
  return (
    <Router>
      <div className="ucab-layout">
        <nav className="navbar navbar-expand-lg navbar-dark ucab-nav-blur shadow-sm">
          <div className="container">
            <Link className="navbar-brand fw-bold" to="/">
              Ucab
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#ucabNavbar"
              aria-controls="ucabNavbar"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="ucabNavbar">
              <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/search">
                  Search Cabs
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/bookings">
                  Book Ride
                </Link>
              </li>
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
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  More
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/driver/register">
                      Driver Registration
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/driver/verify">
                      Driver Verification
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/payments">
                      Payments
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/history-support">
                      History & Support
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/track">
                      Track Ride
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
        </nav>
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
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
