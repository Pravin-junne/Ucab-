import express from 'express';
import Driver from '../models/Driver.js';
import Booking from '../models/Booking.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get logged-in driver's own profile
router.get('/me', auth, requireRole('driver'), async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id }).populate('user', 'name email phone');
    if (!driver) return res.status(404).json({ message: 'Driver profile not found' });
    res.json(driver);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get completed rides for logged-in driver
router.get('/my-rides', auth, requireRole('driver'), async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) return res.status(404).json({ message: 'Driver profile not found' });

    const rides = await Booking.find({ driver: driver._id, status: 'completed' })
      .populate('rider', 'name phone')
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: list all drivers
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const drivers = await Driver.find().populate('user', 'name email role');
    res.json(drivers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
