import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

function RideTrackingPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('id');
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('ucab_token');

  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${bookingId}`);
      setBooking(res.data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not load ride');
    }
  };

  useEffect(() => {
    if (bookingId && token) {
      fetchBooking();
      const interval = setInterval(fetchBooking, 5000);
      return () => clearInterval(interval);
    }
  }, [bookingId]);

  if (!bookingId) {
    return <p>No booking id provided.</p>;
  }

  if (!token) {
    return <p>Please login to track your ride.</p>;
  }

  return (
    <div>
      <h2 className="mb-3">Ride Tracking</h2>
      {message && <p>{message}</p>}
      {booking && (
        <div className="card bg-dark">
          <div className="card-body">
            <p>
              <strong>From:</strong> {booking.pickupLocation}
            </p>
            <p>
              <strong>To:</strong> {booking.dropoffLocation}
            </p>
            <p>
              <strong>Status:</strong> {booking.status}
            </p>
            <p>
              <strong>Estimated Fare:</strong> ₹{booking.estimatedFare}
            </p>
            <p>
              <strong>Scheduled Time:</strong>{' '}
              {new Date(booking.scheduledTime).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default RideTrackingPage;

