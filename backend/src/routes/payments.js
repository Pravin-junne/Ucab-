import express from 'express';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create payment for a booking (any authenticated rider/driver/admin)
router.post('/', auth, async (req, res) => {
  try {
    const { bookingId, amount, method } = req.body;
    if (!bookingId || !amount || !method) {
      return res.status(400).json({ message: 'bookingId, amount and method are required' });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const payment = await Payment.create({
      booking: bookingId,
      user: req.user._id,
      amount,
      method,
      status: 'paid',
      transactionId: `TXN-${Date.now()}`
    });

    booking.paymentStatus = 'paid';
    await booking.save();

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// List payments for current user
router.get('/', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

