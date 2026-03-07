/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Swal from "sweetalert2";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const carIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
  iconSize: [40, 40]
});

function MapController({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, map.getZoom()); }, [center]);
  return null;
}

function RideTrackingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("id");

  const token = localStorage.getItem("ucab_token");
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` }
  });

  const mapRef = useRef(null);
  const routeRef = useRef(null);
  const animIntervalRef = useRef(null);

  const [booking, setBooking] = useState(null);
  const [phase, setPhase] = useState("toPickup"); // "toPickup" | "toDropoff" | "completed"
  const [driverLocation, setDriverLocation] = useState(null);
  const [eta, setEta] = useState(8);
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const driverStart = { lat: 18.515, lng: 73.850 };

  // Fetch booking
  useEffect(() => {
    if (!bookingId || !token) return;
    api.get(`/bookings/${bookingId}`).then((res) => {
      setBooking(res.data);
      setDriverLocation(driverStart);
    }).catch(() => {});
  }, [bookingId]);

  // ETA countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setEta((prev) => (prev > 0 ? prev - 1 : 0));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Animate driver between two coords
  const animateDriver = (from, to, onDone) => {
    const steps = 60;
    let step = 0;
    const latStep = (to.lat - from.lat) / steps;
    const lngStep = (to.lng - from.lng) / steps;

    if (animIntervalRef.current) clearInterval(animIntervalRef.current);

    animIntervalRef.current = setInterval(() => {
      step++;
      setDriverLocation((prev) => ({
        lat: prev.lat + latStep,
        lng: prev.lng + lngStep
      }));
      if (step >= steps) {
        clearInterval(animIntervalRef.current);
        onDone();
      }
    }, 200);
  };

  // Phase 1: driver → pickup
  useEffect(() => {
    if (!booking || phase !== "toPickup") return;
    const pickup = booking.pickupCoords;
    if (!pickup) return;

    if (mapRef.current) {
      try {
        if (routeRef.current) mapRef.current.removeControl(routeRef.current);
        routeRef.current = L.Routing.control({
          waypoints: [L.latLng(driverStart.lat, driverStart.lng), L.latLng(pickup.lat, pickup.lng)],
          addWaypoints: false, draggableWaypoints: false, show: false
        }).addTo(mapRef.current);
      } catch { /* routing optional */ }
    }

    animateDriver(driverStart, pickup, () => {
      setPhase("toDropoff");
      Swal.fire({ title: "Driver Arrived!", text: "Your driver is at the pickup point.", icon: "success", timer: 2000, showConfirmButton: false });
    });

    return () => { if (animIntervalRef.current) clearInterval(animIntervalRef.current); };
  }, [booking, phase]);

  // Phase 2: pickup → drop
  useEffect(() => {
    if (!booking || phase !== "toDropoff") return;
    const pickup = booking.pickupCoords;
    const drop = booking.dropCoords;
    if (!pickup || !drop) return;

    if (mapRef.current) {
      try {
        if (routeRef.current) mapRef.current.removeControl(routeRef.current);
        routeRef.current = L.Routing.control({
          waypoints: [L.latLng(pickup.lat, pickup.lng), L.latLng(drop.lat, drop.lng)],
          addWaypoints: false, draggableWaypoints: false, show: false
        }).addTo(mapRef.current);
      } catch { /* routing optional */ }
    }

    animateDriver(pickup, drop, async () => {
      try { await api.put(`/bookings/${bookingId}/complete`); } catch { /* ignore */ }
      setPhase("completed");
    });

    return () => { if (animIntervalRef.current) clearInterval(animIntervalRef.current); };
  }, [phase]);

  const handleRate = async (star) => {
    setRating(star);
    try {
      await api.put(`/bookings/${bookingId}/rate`, { rating: star });
      setRatingSubmitted(true);
      Swal.fire({ title: "Thank you!", text: `You rated this ride ${star}/5`, icon: "success", confirmButtonText: "Go Home" })
        .then(() => navigate("/bookings"));
    } catch {
      Swal.fire("Error", "Could not submit rating", "error");
    }
  };

  if (!token) return <p className="p-4">Please login to track your ride.</p>;
  if (!bookingId) return <p className="p-4">No booking ID provided.</p>;

  const center = driverLocation
    ? [driverLocation.lat, driverLocation.lng]
    : [18.5204, 73.8567];

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Ride Tracking</h2>

      {/* Phase status banner */}
      <div className={`alert ${phase === "completed" ? "alert-success" : "alert-info"} mb-3`}>
        {phase === "toPickup" && `Driver is heading to your pickup — ETA ~${eta} min`}
        {phase === "toDropoff" && "Ride in progress — heading to your destination"}
        {phase === "completed" && "Ride Completed!"}
      </div>

      {/* Map */}
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: "400px", width: "100%" }}
        className="mb-4"
        whenCreated={(map) => (mapRef.current = map)}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={driverLocation ? [driverLocation.lat, driverLocation.lng] : null} />

        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={carIcon}>
            <Popup>Your driver</Popup>
          </Marker>
        )}

        {booking?.pickupCoords && (
          <Marker position={[booking.pickupCoords.lat, booking.pickupCoords.lng]}>
            <Popup>Pickup: {booking.pickupLocation}</Popup>
          </Marker>
        )}

        {booking?.dropCoords && (
          <Marker position={[booking.dropCoords.lat, booking.dropCoords.lng]}>
            <Popup>Drop: {booking.dropLocation}</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Booking details + driver profile */}
      {booking && (
        <div className="card mb-4">
          <div className="card-body">
            {booking.driver && (
              <>
                <h6 className="mb-2 text-success">Your Driver</h6>
                <div className="d-flex align-items-center gap-3 mb-3 p-2 bg-light rounded">
                  <div style={{ fontSize: "2.5rem" }}>🚗</div>
                  <div>
                    <p className="mb-0 fw-bold">{booking.driver.user?.name}</p>
                    <p className="mb-0 text-muted">{booking.driver.user?.phone}</p>
                    <p className="mb-1">
                      <span className="badge bg-secondary me-1">{booking.driver.vehicleType?.toUpperCase()}</span>
                      {booking.driver.vehicleNumber && (
                        <span className="badge bg-light text-dark border">{booking.driver.vehicleNumber}</span>
                      )}
                    </p>
                    <p className="mb-0 small text-muted">
                      Rating: {booking.driver.rating > 0 ? Number(booking.driver.rating).toFixed(1) : "New"} ⭐
                    </p>
                  </div>
                </div>
                <hr className="my-2" />
              </>
            )}
            <p className="mb-1"><strong>From:</strong> {booking.pickupLocation}</p>
            <p className="mb-1"><strong>To:</strong> {booking.dropLocation}</p>
            <p className="mb-1"><strong>Fare:</strong> Rs.{booking.fare}</p>
            <p className="mb-0"><strong>Status:</strong> {booking.status}</p>
          </div>
        </div>
      )}

      {/* Rating after completion */}
      {phase === "completed" && !ratingSubmitted && (
        <div className="card p-4 text-center">
          <h5>Rate your driver</h5>
          <p className="text-muted">How was your ride?</p>
          <div className="d-flex justify-content-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`btn btn-lg ${rating >= star ? "btn-warning" : "btn-outline-warning"}`}
                onClick={() => handleRate(star)}
                style={{ fontSize: "1.5rem", padding: "0.3rem 0.8rem" }}
              >
                ★
              </button>
            ))}
          </div>
          <p className="text-muted">{rating > 0 ? `Selected: ${rating}/5` : "Tap a star to rate"}</p>
        </div>
      )}

      {ratingSubmitted && (
        <div className="alert alert-success text-center">
          Rating submitted! Thank you.
        </div>
      )}
    </div>
  );
}

export default RideTrackingPage;
