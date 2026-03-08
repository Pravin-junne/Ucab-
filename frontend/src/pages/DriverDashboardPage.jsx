import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:5000");

function DriverDashboardPage() {
  const navigate = useNavigate();

  const token = localStorage.getItem("ucab_token");

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` }
  });

  const [driver, setDriver] = useState(null);
  const [rideRequests, setRideRequests] = useState([]);
  const [rideHistory, setRideHistory] = useState([]);
  const [activeTab, setTab] = useState("requests");
  const [acceptedRide, setAcceptedRide] = useState(null);

  // Fetch driver profile
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    const stored = JSON.parse(localStorage.getItem("ucab_user") || "{}");
    if (stored?.role !== "driver") { navigate("/bookings", { replace: true }); return; }

    api.get("/drivers/me").then((res) => {
      setDriver(res.data);
      socket.emit("joinDriverRoom", { vehicleType: res.data.vehicleType });

      // Load any pending bookings already in DB (in case socket missed them)
      api.get("/bookings/pending").then((pending) => {
        setRideRequests(pending.data.map((b) => ({
          bookingId: b._id,
          pickupLocation: b.pickupLocation,
          dropLocation: b.dropLocation,
          fare: b.fare,
          distance: b.distance,
          vehicleType: b.vehicleType,
          riderName: b.rider?.name
        })));
      }).catch(() => {});
    }).catch(() => {
      Swal.fire("Error", "Could not load driver profile", "error");
    });

    api.get("/drivers/my-rides").then((res) => {
      setRideHistory(res.data);
    }).catch(() => {});
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-join driver room if socket reconnects (e.g. server restart)
  useEffect(() => {
    const rejoin = () => {
      if (driver?.vehicleType) {
        socket.emit("joinDriverRoom", { vehicleType: driver.vehicleType });
      }
    };
    socket.on("connect", rejoin);
    return () => socket.off("connect", rejoin);
  }, [driver?.vehicleType]);

  // Listen for ride requests via socket
  useEffect(() => {
    socket.on("newRideRequest", (data) => {
      setRideRequests((prev) => {
        const exists = prev.find((r) => String(r.bookingId) === String(data.bookingId));
        if (exists) return prev;
        return [data, ...prev];
      });
    });

    socket.on("rideRequestCancelled", ({ bookingId }) => {
      setRideRequests((prev) => prev.filter((r) => String(r.bookingId) !== String(bookingId)));
    });

    return () => {
      socket.off("newRideRequest");
      socket.off("rideRequestCancelled");
    };
  }, []);

  const handleAccept = async (request) => {
    try {
      await api.put(`/bookings/${request.bookingId}/accept`);
      setRideRequests([]);
      setAcceptedRide(request);
      Swal.fire("Ride Accepted!", "Head to the pickup location.", "success");
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Could not accept ride", "error");
    }
  };

  const handleReject = (bookingId) => {
    setRideRequests((prev) => prev.filter((r) => String(r.bookingId) !== String(bookingId)));
  };

  const handleComplete = async () => {
    if (!acceptedRide) return;
    try {
      await api.put(`/bookings/${acceptedRide.bookingId}/complete`);
      setAcceptedRide(null);
      const res = await api.get("/drivers/my-rides");
      setRideHistory(res.data);
      Swal.fire("Ride Completed!", "Well done!", "success");
    } catch {
      Swal.fire("Error", "Could not mark ride as complete", "error");
    }
  };

  if (!token) return null;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Driver Dashboard</h2>

      {/* Profile Card */}
      {driver && (
        <div className="card mb-4 p-3">
          <div className="d-flex align-items-center gap-3">
            <div style={{ fontSize: "3rem" }}>🚗</div>
            <div>
              <h4 className="mb-0">{driver.user?.name}</h4>
              <p className="mb-0 text-muted">{driver.user?.phone} &bull; {driver.vehicleType?.toUpperCase()}</p>
              <p className="mb-0">
                Rating: <strong>{driver.rating > 0 ? driver.rating.toFixed(1) : "New"}</strong>
                &nbsp;&bull;&nbsp;
                Rides: <strong>{driver.completedRides}</strong>
              </p>
              {driver.licenseNumber && (
                <p className="mb-0 text-muted" style={{ fontSize: "0.85rem" }}>
                  License: {driver.licenseNumber}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Ride Banner */}
      {acceptedRide && (
        <div className="alert alert-success mb-4">
          <h5>Active Ride</h5>
          <p className="mb-1"><strong>Pickup:</strong> {acceptedRide.pickupLocation}</p>
          <p className="mb-1"><strong>Drop:</strong> {acceptedRide.dropLocation}</p>
          <p className="mb-2"><strong>Fare:</strong> Rs.{acceptedRide.fare}</p>
          <button className="btn btn-dark" onClick={handleComplete}>
            Mark as Completed
          </button>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setTab("requests")}
          >
            Ride Requests{rideRequests.length > 0 && (
              <span className="badge bg-danger ms-1">{rideRequests.length}</span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setTab("history")}
          >
            Ride History
          </button>
        </li>
      </ul>

      {/* Ride Requests Tab */}
      {activeTab === "requests" && (
        <div>
          {rideRequests.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div style={{ fontSize: "3rem" }}>📭</div>
              <p>No ride requests yet. Waiting for bookings...</p>
            </div>
          ) : (
            rideRequests.map((req) => (
              <div key={String(req.bookingId)} className="card mb-3 border-primary">
                <div className="card-body">
                  <h5 className="card-title">New Ride Request</h5>
                  <p className="mb-1"><strong>Rider:</strong> {req.riderName}</p>
                  <p className="mb-1"><strong>Pickup:</strong> {req.pickupLocation}</p>
                  <p className="mb-1"><strong>Drop:</strong> {req.dropLocation}</p>
                  <p className="mb-1"><strong>Distance:</strong> {req.distance ? Number(req.distance).toFixed(2) : "—"} km</p>
                  <p className="mb-3"><strong>Fare:</strong> Rs.{req.fare}</p>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success"
                      onClick={() => handleAccept(req)}
                      disabled={!!acceptedRide}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleReject(req.bookingId)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Ride History Tab */}
      {activeTab === "history" && (
        <div>
          {rideHistory.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div style={{ fontSize: "3rem" }}>📋</div>
              <p>No completed rides yet.</p>
            </div>
          ) : (
            rideHistory.map((ride) => (
              <div key={ride._id} className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="mb-1"><strong>From:</strong> {ride.pickupLocation}</p>
                      <p className="mb-1"><strong>To:</strong> {ride.dropLocation}</p>
                      <p className="mb-1"><strong>Rider:</strong> {ride.rider?.name}</p>
                      <p className="mb-0">
                        <strong>Fare:</strong> Rs.{ride.fare} &bull; {Number(ride.distance).toFixed(1)} km
                      </p>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-success mb-2 d-block">Completed</span>
                      {ride.rating && (
                        <span className="badge bg-warning text-dark">
                          {"★".repeat(ride.rating)}{"☆".repeat(5 - ride.rating)} {ride.rating}/5
                        </span>
                      )}
                      <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
                        {new Date(ride.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default DriverDashboardPage;
