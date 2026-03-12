import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IBusinessHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface ILocation extends Document {
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  whatsapp?: string;
  image?: string;
  hours: IBusinessHours[];
  isFlagship: boolean;
  mapCoordinates?: { lat: number; lng: number };
  createdAt: Date;
  updatedAt: Date;
}

const businessHoursSchema = new Schema<IBusinessHours>(
  {
    day: { type: String, required: true },
    open: { type: String, required: true },
    close: { type: String, required: true },
    closed: { type: Boolean, default: false },
  },
  { _id: false }
);

const locationSchema = new Schema<ILocation>(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    image: { type: String },
    email: { type: String, lowercase: true, trim: true },
    whatsapp: { type: String, trim: true },
    hours: [businessHoursSchema],
    isFlagship: { type: Boolean, default: false },
    mapCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true }
);

const Location: Model<ILocation> =
  mongoose.models.Location || mongoose.model<ILocation>("Location", locationSchema);

export default Location;
