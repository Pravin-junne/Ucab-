import { useEffect, useState } from 'react';
import axios from 'axios';

function BookingsPage() {
  const [form, setForm] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    scheduledTime: ''
  });
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('ucab_token');

  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/bookings', form);
      setMessage('Booking created!');
      setForm({ pickupLocation: '', dropoffLocation: '', scheduledTime: '' });
      fetchBookings();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <div className="row">
      <div className="col-md-4">
        <h2 className=" text-white mb-3">Book a Ride</h2>
        {!token && <p>Please login to create a booking.</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Pickup Location</label>
            <input
              type="text"
              name="pickupLocation"
              className="form-control"
              value={form.pickupLocation}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Dropoff Location</label>
            <input
              type="text"
              name="dropoffLocation"
              className="form-control"
              value={form.dropoffLocation}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Scheduled Time</label>
            <input
              type="datetime-local"
              name="scheduledTime"
              className="form-control"
              value={form.scheduledTime}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={!token}>
            Create Booking
          </button>
        </form>
        {message && <p className="mt-3">{message}</p>}
      </div>
      <div className="col-md-8">
        <h2 className="mb-3">My Bookings</h2>
        {bookings.length === 0 ? (
          <p>No bookings yet.</p>
        ) : (
          <table className="table table-dark table-striped">
            <thead>
              <tr>
                <th>Pickup</th>
                <th>Dropoff</th>
                <th>Status</th>
                <th>Scheduled</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.pickupLocation}</td>
                  <td>{b.dropoffLocation}</td>
                  <td>{b.status}</td>
                  <td>{new Date(b.scheduledTime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default BookingsPage;

