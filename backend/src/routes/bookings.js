import express from 'express';
import Booking from '../models/Booking.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Create a booking (cab ride) - riders only
router.post('/', auth, requireRole('rider'), async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, scheduledTime, distanceKm } = req.body;
    if (!pickupLocation || !dropoffLocation || !scheduledTime) {
      return res.status(400).json({ message: 'pickup, dropoff and time are required' });
    }

    const distance = Number(distanceKm) || 5;
    const baseFare = 30;
    const perKm = 12;
    const estimatedFare = baseFare + distance * perKm;

    const booking = await Booking.create({
      rider: req.user._id,
      pickupLocation,
      dropoffLocation,
      scheduledTime,
      distanceKm: distance,
      estimatedFare
    });
    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bookings for current user (rider history)
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ rider: req.user._id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Simple "search nearby cabs" with fare estimation (no real geo yet)
router.post('/search', auth, async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, distanceKm } = req.body;
    if (!pickupLocation || !dropoffLocation) {
      return res.status(400).json({ message: 'pickup and dropoff are required' });
    }
    const distance = Number(distanceKm) || 5;
    const baseFare = 30;
    const perKm = 12;
    const estimatedFare = baseFare + distance * perKm;

    res.json({
      nearbyCabs: 3,
      distanceKm: distance,
      estimatedFare
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update ride status (used for tracking: accepted, ongoing, completed, cancelled) - driver/admin
router.patch('/:id/status', auth, requireRole('driver', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single booking (for tracking screen)
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

