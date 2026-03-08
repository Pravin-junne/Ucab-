import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="row gy-4 align-items-center">
      <div className="col-lg-7">
        <section className="p-4 p-md-5 rounded-4 text-white" style={{ background: "linear-gradient(135deg, #0f3460 0%, #1a237e 100%)" }}>
          <div className="mb-3">
            <span className="badge bg-white fw-semibold px-3 py-2" style={{ color: "#0f3460" }}>
              Smart taxi platform · 24x7
            </span>
          </div>
          <h1 className="fw-bold mb-3" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)" }}>
            Book your next ride in seconds with UCab.
          </h1>
          <p className="mb-4 opacity-75" style={{ maxWidth: "36rem" }}>
            A modern cab booking system for riders and drivers. Search nearby cabs, estimate
            fares, track rides in real time, pay online, and manage your ride history.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/bookings" className="btn btn-light btn-lg fw-semibold">
              Book a Ride
            </Link>
            <Link to="/search" className="btn btn-outline-light btn-lg">
              Check Nearby Cabs
            </Link>
          </div>
          <div className="mt-4 row g-3">
            <div className="col-6 col-md-4">
              <p className="mb-0 fw-semibold">Real-time tracking</p>
              <p className="mb-0 opacity-75 small">Follow your cab from pickup to drop.</p>
            </div>
            <div className="col-6 col-md-4">
              <p className="mb-0 fw-semibold">Verified drivers</p>
              <p className="mb-0 opacity-75 small">Registered and verified in the portal.</p>
            </div>
            <div className="col-6 col-md-4">
              <p className="mb-0 fw-semibold">Secure payments</p>
              <p className="mb-0 opacity-75 small">Pay online and download receipts.</p>
            </div>
          </div>
        </section>
      </div>
      <div className="col-lg-5">
        <div className="card shadow-sm">
          <div className="card-header">
            <h2 className="fs-5 fw-bold mb-1">Quick access</h2>
            <p className="mb-0 text-muted small">
              Start as a rider or register as a driver.
            </p>
          </div>
          <div className="card-body">
            <div className="d-grid gap-2 mb-3">
              <Link to="/login" className="btn btn-primary">
                Login to your account
              </Link>
              <Link to="/register" className="btn btn-outline-primary">
                Create rider account
              </Link>
            </div>
            <hr />
            <p className="text-muted small mb-2">Driver onboarding</p>
            <ul className="text-muted small ps-3 mb-0">
              <li>Register as a driver with your vehicle details.</li>
              <li>Wait for admin verification.</li>
              <li>Start accepting trips and manage your rides.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

