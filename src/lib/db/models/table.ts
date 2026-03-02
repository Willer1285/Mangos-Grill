import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ITable extends Document {
  number: number;
  name: string;
  capacity: number;
  location: string;
  status: "Available" | "Occupied" | "Reserved";
  position: { x: number; y: number };
  shape: "round" | "square" | "rectangle";
  createdAt: Date;
  updatedAt: Date;
}

const tableSchema = new Schema<ITable>(
  {
    number: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1, max: 20 },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["Available", "Occupied", "Reserved"],
      default: "Available",
      index: true,
    },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    shape: {
      type: String,
      enum: ["round", "square", "rectangle"],
      default: "round",
    },
  },
  { timestamps: true }
);

tableSchema.index({ location: 1, status: 1 });

const Table: Model<ITable> =
  mongoose.models.Table || mongoose.model<ITable>("Table", tableSchema);

export default Table;
