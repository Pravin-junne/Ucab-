import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  licenseNumber: {
    type: String,
    required: true
  },

  vehicleType: {
    type: String,
    enum: ["bike", "auto", "car", "suv"],
    required: true
  },

  vehicleNumber: {
    type: String,
    default: ""
  },

  vehicleModel: {
    type: String,
    default: ""
  },

  rating: {
    type: Number,
    default: 0
  },

  totalRatingSum: {
    type: Number,
    default: 0
  },

  completedRides: {
    type: Number,
    default: 0
  },

  isAvailable: {
    type: Boolean,
    default: true
  },

  currentLocation: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  }

}, { timestamps: true });

export default mongoose.model("Driver", driverSchema);
