/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const socket = io("http://localhost:5000");

// Fare rates per vehicle type
const FARE_RATES = {
  bike: { base: 20, perKm: 8,  label: "Bike", emoji: "🏍️", desc: "Fastest, cheapest" },
  auto: { base: 30, perKm: 10, label: "Auto", emoji: "🛺", desc: "Affordable, 3-wheeler" },
  car:  { base: 40, perKm: 12, label: "Mini", emoji: "🚗", desc: "Comfortable sedan" },
  suv:  { base: 60, perKm: 15, label: "SUV",  emoji: "🚙", desc: "Premium, spacious" }
};

const calcFare = (type, dist) => {
  if (!dist || dist <= 0) return 0;
  const r = FARE_RATES[type];
  return Math.round(r.base + r.perKm * dist);
};

const haversineDistance = (p1, p2) => {
  const R = 6371;
  const dLat = (p2.lat - p1.lat) * (Math.PI / 180);
  const dLon = (p2.lng - p1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(p1.lat * (Math.PI / 180)) * Math.cos(p2.lat * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Search using Nominatim — India focused
const searchPlace = async (query) => {
  const encoded = encodeURIComponent(query + " India");
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=6&addressdetails=1`,
    { headers: { "Accept-Language": "en", "Accept": "application/json" } }
  );
  return res.json();
};

// Re-centers the map when pickup coords change
function MapController({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center[0], center[1]]);
  return null;
}

// Build short readable label from Nominatim address object
const buildLabel = (data) => {
  if (!data) return null;
  const a = data.address || {};
  const parts = [
    a.railway || a.amenity || a.road || a.pedestrian || a.footway,
    a.suburb || a.neighbourhood || a.quarter,
    a.city || a.town || a.village || a.county,
    a.state
  ].filter(Boolean);
  return parts.length >= 2 ? parts.join(", ") : data.display_name;
};

function BookingsPage() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const routeRef = useRef(null);

  const token = localStorage.getItem("ucab_token");
  const user = JSON.parse(localStorage.getItem("ucab_user") || "{}");

  // Redirect drivers to their dashboard, unauthenticated users to login
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    } else if (user?.role === "driver") {
      navigate("/driver-dashboard", { replace: true });
    }
  }, []);

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` }
  });

  const [vehicle, setVehicle] = useState("car");
  const [pickupInput, setPickupInput] = useState("");
  const [dropInput, setDropInput] = useState("");
  const [pickupCoords, setPickupCoords] = useState({ lat: 18.5204, lng: 73.8567 });
  const [dropCoords, setDropCoords] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [distance, setDistance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [driverInfo, setDriverInfo] = useState(null);

  // Join rider socket room + listen for driver accept
  useEffect(() => {
    if (user?.id) {
      socket.emit("joinRiderRoom", { riderId: user.id });
    }
    socket.on("rideAccepted", (data) => {
      setLoading(false);
      setDriverInfo(data);
      Swal.fire({
        title: "Driver Found!",
        html: `<b>${data.driverName}</b> is on the way!<br/>Vehicle: ${data.vehicleType?.toUpperCase()}`,
        icon: "success",
        confirmButtonText: "Track Ride"
      }).then(() => navigate(`/track?id=${data.bookingId}`));
    });
    return () => { socket.off("rideAccepted"); };
  }, [user?.id]);

  // Recalculate distance whenever either coord changes
  useEffect(() => {
    if (!dropCoords || !pickupCoords) return;

    const dist = haversineDistance(pickupCoords, dropCoords);
    setDistance(dist);

    // Draw route on map if map is ready
    if (mapRef.current) {
      if (routeRef.current) {
        try { mapRef.current.removeControl(routeRef.current); } catch { /* ignore */ }
      }
      try {
        routeRef.current = L.Routing.control({
          waypoints: [
            L.latLng(pickupCoords.lat, pickupCoords.lng),
            L.latLng(dropCoords.lat, dropCoords.lng)
          ],
          addWaypoints: false,
          draggableWaypoints: false,
          show: false
        }).addTo(mapRef.current);
      } catch { /* routing optional */ }
    }
  }, [pickupCoords, dropCoords]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire("Not Supported", "Geolocation is not supported by your browser", "warning");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        // Set coords immediately so fare calculates even if reverse geocode fails
        setPickupCoords({ lat, lng });
        setPickupInput(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const label = buildLabel(data);
          if (label) setPickupInput(label);
        } catch { /* keep coordinate fallback */ }
      },
      (err) => {
        const msgs = {
          1: "Location permission denied. Please allow location access.",
          2: "Location unavailable. Try searching manually.",
          3: "Location request timed out. Try again."
        };
        Swal.fire("Location Error", msgs[err.code] || "Could not get location", "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePickupSearch = async (value) => {
    setPickupInput(value);
    if (value.length < 3) { setSuggestions([]); return; }
    try {
      const data = await searchPlace(value);
      setSuggestions(data);
    } catch { setSuggestions([]); }
  };

  const handleDropSearch = async (value) => {
    setDropInput(value);
    if (value.length < 3) { setDropSuggestions([]); return; }
    try {
      const data = await searchPlace(value);
      setDropSuggestions(data);
    } catch { setDropSuggestions([]); }
  };

  const handleBooking = async () => {
    if (!token) {
      Swal.fire("Please Login", "You must be logged in to book a ride", "warning")
        .then(() => navigate("/login"));
      return;
    }
    if (!pickupInput || !dropCoords) {
      Swal.fire("Missing Info", "Please set both pickup and drop locations", "warning");
      return;
    }
    setLoading(true);
    try {
      await api.post("/bookings", {
        pickupLocation: pickupInput,
        dropLocation: dropInput,
        pickupCoords,
        dropCoords,
        vehicleType: vehicle,
        fare: calcFare(vehicle, distance),
        distance
      });
      Swal.fire({
        title: "Booking Confirmed!",
        text: "Waiting for a driver to accept...",
        icon: "info",
        showConfirmButton: false,
        timer: 3000
      });
    } catch (error) {
      setLoading(false);
      Swal.fire("Error", error.response?.data?.message || "Booking failed", "error");
    }
  };

  if (!token || user?.role === "driver") return null;

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Book Your Ride</h2>

      <MapContainer
        center={[pickupCoords.lat, pickupCoords.lng]}
        zoom={13}
        style={{ height: "380px", width: "100%" }}
        className="mb-4"
        whenCreated={(map) => (mapRef.current = map)}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={[pickupCoords.lat, pickupCoords.lng]} />
        <Marker position={[pickupCoords.lat, pickupCoords.lng]}>
          <Popup>Pickup Location</Popup>
        </Marker>
        {dropCoords && (
          <Marker position={[dropCoords.lat, dropCoords.lng]}>
            <Popup>Drop Location</Popup>
          </Marker>
        )}
      </MapContainer>

      <div className="card p-4 shadow">

        {/* Pickup */}
        <div className="mb-3 position-relative">
          <label className="form-label fw-bold">Pickup Location</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              value={pickupInput}
              onChange={(e) => handlePickupSearch(e.target.value)}
              placeholder="Search pickup area, city..."
            />
            <button className="btn btn-outline-primary" onClick={getCurrentLocation}>
              📍 Current
            </button>
          </div>
          {suggestions.length > 0 && (
            <ul className="list-group mt-1 position-absolute w-100" style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}>
              {suggestions.map((item) => (
                <li
                  key={item.place_id}
                  className="list-group-item list-group-item-action"
                  style={{ cursor: "pointer", fontSize: "0.85rem" }}
                  onClick={() => {
                    setPickupInput(buildLabel(item) || item.display_name);
                    setPickupCoords({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
                    setSuggestions([]);
                  }}
                >
                  📍 {buildLabel(item) || item.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Drop */}
        <div className="mb-4 position-relative">
          <label className="form-label fw-bold">Drop Location</label>
          <input
            type="text"
            className="form-control"
            value={dropInput}
            onChange={(e) => handleDropSearch(e.target.value)}
            placeholder="Search destination, city..."
          />
          {dropSuggestions.length > 0 && (
            <ul className="list-group mt-1 position-absolute w-100" style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}>
              {dropSuggestions.map((item) => (
                <li
                  key={item.place_id}
                  className="list-group-item list-group-item-action"
                  style={{ cursor: "pointer", fontSize: "0.85rem" }}
                  onClick={() => {
                    setDropInput(buildLabel(item) || item.display_name);
                    setDropCoords({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
                    setDropSuggestions([]);
                  }}
                >
                  📍 {buildLabel(item) || item.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Ride options */}
        <h5 className="mb-2">Choose Ride Type</h5>
        {distance > 0 && (
          <p className="text-muted mb-3" style={{ fontSize: "0.88rem" }}>
            Estimated distance: <strong>{distance.toFixed(2)} km</strong>
          </p>
        )}

        <div className="d-flex flex-column gap-2 mb-4">
          {Object.entries(FARE_RATES).map(([type, info]) => {
            const fare = calcFare(type, distance);
            const isSelected = vehicle === type;
            return (
              <div
                key={type}
                className={`d-flex align-items-center justify-content-between p-3 border rounded ${isSelected ? "border-primary bg-primary text-white" : "bg-light"}`}
                style={{ cursor: "pointer", transition: "all 0.15s" }}
                onClick={() => setVehicle(type)}
              >
                <div className="d-flex align-items-center gap-3">
                  <span style={{ fontSize: "1.8rem" }}>{info.emoji}</span>
                  <div>
                    <div className="fw-bold">{info.label}</div>
                    <div style={{ fontSize: "0.78rem", opacity: 0.75 }}>{info.desc}</div>
                  </div>
                </div>
                <div className="text-end">
                  <div className="fw-bold fs-5">
                    {distance > 0 ? `Rs.${fare}` : "—"}
                  </div>
                  <div style={{ fontSize: "0.72rem", opacity: 0.7 }}>
                    Rs.{info.base} base + Rs.{info.perKm}/km
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Driver info after accept */}
        {driverInfo && (
          <div className="alert alert-success mb-3">
            <h6 className="mb-2">Driver on the way!</h6>
            <p className="mb-1"><strong>Name:</strong> {driverInfo.driverName}</p>
            <p className="mb-1"><strong>Phone:</strong> {driverInfo.driverPhone}</p>
            <p className="mb-1"><strong>Vehicle:</strong> {driverInfo.vehicleType?.toUpperCase()}</p>
            {driverInfo.vehicleNumber && <p className="mb-1"><strong>Plate:</strong> {driverInfo.vehicleNumber}</p>}
            <p className="mb-0"><strong>Rating:</strong> {driverInfo.rating > 0 ? Number(driverInfo.rating).toFixed(1) : "New"} ⭐</p>
          </div>
        )}

        {/* Confirm */}
        <button
          className="btn btn-success w-100 py-2"
          onClick={handleBooking}
          disabled={loading || !dropCoords}
          style={{ fontSize: "1.05rem" }}
        >
          {loading
            ? "Finding Driver..."
            : distance > 0
              ? `Book ${FARE_RATES[vehicle].label} — Rs.${calcFare(vehicle, distance)}`
              : "Select drop location to see fare"}
        </button>

        {loading && (
          <div className="text-center mt-3">
            <div className="spinner-border text-primary" />
            <p className="mt-2 text-muted small">Finding nearby drivers...</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default BookingsPage;
