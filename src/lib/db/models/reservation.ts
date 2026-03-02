import mongoose, { Schema, type Document, type Model } from "mongoose";
import { OCCASIONS, RESERVATION_STATUSES } from "@/lib/constants";

export interface IReservation extends Document {
  customer?: mongoose.Types.ObjectId;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  date: Date;
  time: string;
  partySize: number;
  table?: mongoose.Types.ObjectId;
  occasion?: string;
  specialRequests?: string;
  status: "Pending" | "Confirmed" | "Seated" | "Completed" | "Cancelled" | "No-show";
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", index: true },
    guestName: { type: String, trim: true },
    guestPhone: { type: String, trim: true },
    guestEmail: { type: String, lowercase: true, trim: true },
    date: { type: Date, required: true, index: true },
    time: { type: String, required: true },
    partySize: { type: Number, required: true, min: 1, max: 20 },
    table: { type: Schema.Types.ObjectId, ref: "Table" },
    occasion: {
      type: String,
      enum: [...OCCASIONS],
    },
    specialRequests: { type: String, maxlength: 500 },
    status: {
      type: String,
      enum: Object.values(RESERVATION_STATUSES),
      default: "Pending",
      index: true,
    },
    location: { type: String, required: true },
  },
  { timestamps: true }
);

reservationSchema.index({ date: 1, status: 1 });

const Reservation: Model<IReservation> =
  mongoose.models.Reservation ||
  mongoose.model<IReservation>("Reservation", reservationSchema);

export default Reservation;
