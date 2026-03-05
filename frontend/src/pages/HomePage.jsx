import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="row gy-4 align-items-center">
      <div className="col-lg-7">
        <section className="ucab-hero text-start">
          <div className="mb-3">
            <span className="ucab-pill text-muted-sm">
              Smart taxi platform · 24x7
            </span>
          </div>
          <h1 className="ucab-hero-title mb-3">Book your next ride in seconds with Ucab.</h1>
          <p className="ucab-hero-subtitle mb-4 text-muted-sm">
            Ucab is a modern web-based cab booking system for riders and drivers. Search nearby
            cabs, estimate fares, track rides in real time, pay online, and manage your complete
            ride history — all from one responsive dashboard.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/bookings" className="btn btn-primary btn-lg">
              Book a Ride
            </Link>
            <Link to="/search" className="btn btn-outline-light btn-lg">
              Check Nearby Cabs
            </Link>
          </div>
          <div className="mt-4 row g-3">
            <div className="col-6 col-md-4">
              <p className="mb-0 fw-semibold">Real-time tracking</p>
              <p className="mb-0 text-muted-sm">Follow your cab from pickup to drop.</p>
            </div>
            <div className="col-6 col-md-4">
              <p className="mb-0 fw-semibold">Verified drivers</p>
              <p className="mb-0 text-muted-sm">Drivers are registered and verified in the portal.</p>
            </div>
            <div className="col-6 col-md-4">
              <p className="mb-0 fw-semibold">Secure payments</p>
              <p className="mb-0 text-muted-sm">Pay online and download receipts instantly.</p>
            </div>
          </div>
        </section>
      </div>
      <div className="col-lg-5">
        <div className="ucab-card card text-start">
          <div className="ucab-card-header card-header">
            <h2 className="ucab-section-title mb-0">Quick access</h2>
            <p className="mb-0 text-muted-sm">
              Start as a rider or register as a driver in just a few steps.
            </p>
          </div>
          <div className="card-body">
            <div className="d-grid gap-2 mb-3">
              <Link to="/login" className="btn btn-outline-light">
                Login to your account
              </Link>
              <Link to="/register" className="btn btn-outline-light">
                Create rider account
              </Link>
            </div>
            <hr className="border-secondary" />
            <p className="text-muted-sm mb-2">Driver onboarding</p>
            <ul className="text-muted-sm ps-3 mb-0">
              <li>Register as a driver with your vehicle details.</li>
              <li>Wait for admin verification in the Driver Verification module.</li>
              <li>Start accepting trips and manage your rides.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

