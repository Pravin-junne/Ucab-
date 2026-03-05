import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pickupLocation: { type: String, required: true },
    dropoffLocation: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'],
      default: 'pending'
    },
    fare: { type: Number },
    distanceKm: { type: Number },
    estimatedFare: { type: Number },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid'
    },
    scheduledTime: { type: Date, required: true }
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;

