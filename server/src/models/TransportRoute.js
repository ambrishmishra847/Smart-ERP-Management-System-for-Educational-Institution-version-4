import mongoose from "mongoose";

const transportRouteSchema = new mongoose.Schema(
  {
    routeName: { type: String, required: true, unique: true },
    vehicleNumber: String,
    driverName: String,
    driverPhone: String,
    capacity: { type: Number, default: 40 },
    departureTime: String,
    returnTime: String,
    stops: [{ type: String }],
    notes: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

transportRouteSchema.index({ active: 1, routeName: 1 });

export default mongoose.model("TransportRoute", transportRouteSchema);
