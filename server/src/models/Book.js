import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    accessionNumber: { type: String, required: true, unique: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    isbn: String,
    publisher: String,
    shelf: String,
    copiesTotal: { type: Number, default: 1 },
    copiesAvailable: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model("Book", bookSchema);
