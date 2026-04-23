import mongoose from "mongoose";

const libraryCirculationSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    returnedAt: Date,
    fineAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["issued", "returned", "overdue"],
      default: "issued",
    },
  },
  { timestamps: true }
);

export default mongoose.model("LibraryCirculation", libraryCirculationSchema);
