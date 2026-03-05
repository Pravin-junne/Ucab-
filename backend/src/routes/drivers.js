import express from 'express';
import Driver from '../models/Driver.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Driver self-registration (must be logged-in user with driver role)
router.post('/register', auth, requireRole('driver'), async (req, res) => {
  try {
    const { licenseNumber, vehicleNumber, vehicleModel } = req.body;
    if (!licenseNumber || !vehicleNumber || !vehicleModel) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await Driver.findOne({
      $or: [{ user: req.user._id }, { licenseNumber }]
    });
    if (existing) {
      return res.status(400).json({ message: 'Driver already registered with this user or license' });
    }

    const driver = await Driver.create({
      user: req.user._id,
      licenseNumber,
      vehicleNumber,
      vehicleModel
    });
    res.status(201).json(driver);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: list all drivers or by verification status
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.isVerified !== undefined) {
      filter.isVerified = req.query.isVerified === 'true';
    }
    const drivers = await Driver.find(filter).populate('user', 'name email role');
    res.json(drivers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: verify/unverify driver
router.patch('/:id/verify', auth, requireRole('admin'), async (req, res) => {
  try {
    const { isVerified } = req.body;
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { isVerified: Boolean(isVerified) },
      { new: true }
    );
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Basic CRUD: get driver by id (admin only)
router.get('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).populate('user', 'name email');
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { licenseNumber, vehicleNumber, vehicleModel } = req.body;
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { licenseNumber, vehicleNumber, vehicleModel },
      { new: true, runValidators: true }
    );
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json({ message: 'Driver deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

