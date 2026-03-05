import { useEffect, useState } from 'react';
import axios from 'axios';

function HistorySupportPage() {
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('ucab_token');

  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  const loadData = async () => {
    try {
      const [bRes, tRes] = await Promise.all([api.get('/bookings'), api.get('/support')]);
      setBookings(bRes.data);
      setTickets(tRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/support', form);
      setMessage('Support ticket created');
      setForm({ subject: '', message: '' });
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to create ticket');
    }
  };

  if (!token) {
    return <p>Please login to view history and support.</p>;
  }

  return (
    <div className="row">
      <div className="col-md-7">
        <h2 className="mb-3">Booking History</h2>
        {bookings.length === 0 ? (
          <p>No rides yet.</p>
        ) : (
          <table className="table table-dark table-striped">
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Fare</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.pickupLocation}</td>
                  <td>{b.dropoffLocation}</td>
                  <td>{b.status}</td>
                  <td>{b.estimatedFare ?? '-'}</td>
                  <td>{new Date(b.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="col-md-5">
        <h2 className="mb-3">Support</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Subject</label>
            <input
              type="text"
              name="subject"
              className="form-control"
              value={form.subject}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Message</label>
            <textarea
              name="message"
              className="form-control"
              rows="3"
              value={form.message}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Submit Ticket
          </button>
        </form>
        {message && <p className="mt-3">{message}</p>}

        <h3 className="mt-4">My Tickets</h3>
        {tickets.length === 0 ? (
          <p>No support tickets yet.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {tickets.map((t) => (
              <li key={t._id} className="list-group-item bg-dark text-light">
                <strong>{t.subject}</strong> - {t.status}
                <br />
                <small>{t.message}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default HistorySupportPage;

