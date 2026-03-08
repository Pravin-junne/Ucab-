import express from 'express';
import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import { auth, requireRole } from '../middleware/auth.js';
import { getIo } from '../socket.js';

const router = express.Router();

// Create a booking (riders only)
router.post('/', auth, requireRole('rider'), async (req, res) => {
  try {
    const {
      pickupLocation, dropLocation,
      pickupCoords, dropCoords,
      vehicleType, fare, distance
    } = req.body;

    if (!pickupLocation || !dropLocation || !vehicleType || !pickupCoords || !dropCoords) {
      return res.status(400).json({ message: 'All booking fields are required' });
    }

    const booking = await Booking.create({
      rider: req.user._id,
      pickupLocation,
      dropLocation,
      pickupCoords,
      dropCoords,
      vehicleType,
      fare: fare || 0,
      distance: distance || 0,
      status: 'pending'
    });

    // Emit ride request to all drivers of matching vehicleType
    const io = getIo();
    if (io) {
      io.to(`driver_${vehicleType}`).emit('newRideRequest', {
        bookingId: booking._id,
        pickupLocation,
        dropLocation,
        fare,
        distance,
        vehicleType,
        riderId: req.user._id,
        riderName: req.user.name
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Driver accepts ride
router.put('/:id/accept', auth, requireRole('driver'), async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id }).populate('user', 'name phone');
    if (!driver) return res.status(404).json({ message: 'Driver profile not found' });

    // Check booking exists and is still pending
    const existing = await Booking.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Booking not found' });
    if (existing.status !== 'pending') {
      return res.status(400).json({ message: 'Ride already taken by another driver' });
    }

    // Update without triggering full schema validation
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { driver: driver._id, status: 'accepted' },
      { new: true, runValidators: false }
    );

    // Mark driver as busy
    await Driver.findByIdAndUpdate(driver._id, { isAvailable: false });

    // Notify the rider
    const io = getIo();
    if (io) {
      io.to(`rider_${existing.rider}`).emit('rideAccepted', {
        bookingId: booking._id,
        driverName: driver.user.name,
        driverPhone: driver.user.phone,
        vehicleType: driver.vehicleType,
        vehicleNumber: driver.vehicleNumber,
        vehicleModel: driver.vehicleModel,
        rating: driver.rating,
        driverId: driver._id
      });

      // Tell other drivers this ride is taken
      io.to(`driver_${existing.vehicleType}`).emit('rideRequestCancelled', {
        bookingId: booking._id
      });
    }

    res.json({ message: 'Ride accepted', booking });
  } catch (error) {
    console.error('ACCEPT ERROR:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Driver rejects ride
router.put('/:id/reject', auth, requireRole('driver'), async (req, res) => {
  try {
    res.json({ message: 'Ride rejected' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark ride as completed
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', rideEndTime: new Date() },
      { new: true, runValidators: false }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.driver) {
      await Driver.findByIdAndUpdate(booking.driver, {
        isAvailable: true,
        $inc: { completedRides: 1 }
      });
    }

    res.json({ message: 'Ride completed', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Rate the driver after ride
router.put('/:id/rate', auth, requireRole('rider'), async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Ride not completed yet' });
    }

    await Booking.findByIdAndUpdate(req.params.id, { rating }, { runValidators: false });

    if (booking.driver) {
      const driver = await Driver.findById(booking.driver);
      if (driver) {
        const newSum = (driver.totalRatingSum || 0) + rating;
        const newRating = driver.completedRides > 0 ? newSum / driver.completedRides : rating;
        await Driver.findByIdAndUpdate(booking.driver, {
          totalRatingSum: newSum,
          rating: newRating
        }, { runValidators: false });
      }
    }

    res.json({ message: 'Rating submitted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending bookings for the logged-in driver's vehicle type
router.get('/pending', auth, requireRole('driver'), async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) return res.status(404).json({ message: 'Driver profile not found' });
    const bookings = await Booking.find({ vehicleType: driver.vehicleType, status: 'pending' })
      .populate('rider', 'name phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single booking
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('rider', 'name phone')
      .populate({ path: 'driver', populate: { path: 'user', select: 'name phone' } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings for current rider
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ rider: req.user._id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
