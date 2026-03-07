import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({

  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    default: null
  },

  pickupLocation: {
    type: String,
    required: true
  },

  dropLocation: {
    type: String,
    required: true
  },

  pickupCoords: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },

  dropCoords: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },

  vehicleType: {
    type: String,
    enum: ["bike", "auto", "car", "suv"],
    required: true
  },

  fare: {
    type: Number,
    required: true
  },

  distance: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "ongoing", "completed"],
    default: "pending"
  },

  rating: {
    type: Number,
    default: null
  },

  rideStartTime: {
    type: Date,
    default: null
  },

  rideEndTime: {
    type: Date,
    default: null
  }

}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
