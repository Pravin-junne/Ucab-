import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    licenseNumber: { type: String, required: true, unique: true },
    vehicleNumber: { type: String, required: true },
    vehicleModel: { type: String, required: true },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Driver = mongoose.model('Driver', driverSchema);

export default Driver;

