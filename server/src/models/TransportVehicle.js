import mongoose from "mongoose";

const transportVehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: { type: String, required: true, unique: true },
    busName: String,
    driverName: String,
    driverPhone: String,
    capacity: { type: Number, default: 40 },
    insuranceExpiry: Date,
    fitnessExpiry: Date,
    lastServiceDate: Date,
    status: {
      type: String,
      enum: ["active", "maintenance", "inactive"],
      default: "active",
    },
    notes: String,
  },
  { timestamps: true }
);

transportVehicleSchema.index({ status: 1, vehicleNumber: 1 });

export default mongoose.model("TransportVehicle", transportVehicleSchema);
