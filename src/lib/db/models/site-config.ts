import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IBusinessHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface ISiteConfig extends Document {
  brandName: string;
  logo?: string;
  logoDark?: string;
  logoSize: number;
  displayMode: "logo" | "text" | "both";
  homepageReviewsCount: number;
  contactEmail?: string;
  contactPhone?: string;
  whatsapp?: string;
  address?: string;
  mapCoordinates?: { lat: number; lng: number };
  businessHours: IBusinessHours[];
  createdAt: Date;
  updatedAt: Date;
}

const businessHoursSchema = new Schema<IBusinessHours>(
  {
    day: { type: String, required: true },
    open: { type: String, default: "9:00 AM" },
    close: { type: String, default: "10:00 PM" },
    closed: { type: Boolean, default: false },
  },
  { _id: false }
);

const siteConfigSchema = new Schema<ISiteConfig>(
  {
    brandName: { type: String, required: true, default: "Mango's Grill", trim: true },
    logo: { type: String },
    logoDark: { type: String },
    logoSize: { type: Number, default: 32, min: 16, max: 128 },
    displayMode: {
      type: String,
      enum: ["logo", "text", "both"],
      default: "both",
    },
    homepageReviewsCount: { type: Number, default: 6, min: 1, max: 20 },
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    address: { type: String, trim: true },
    mapCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    businessHours: {
      type: [businessHoursSchema],
      default: [
        { day: "Monday", open: "11:00 AM", close: "10:00 PM", closed: false },
        { day: "Tuesday", open: "11:00 AM", close: "10:00 PM", closed: false },
        { day: "Wednesday", open: "11:00 AM", close: "10:00 PM", closed: false },
        { day: "Thursday", open: "11:00 AM", close: "10:00 PM", closed: false },
        { day: "Friday", open: "11:00 AM", close: "11:00 PM", closed: false },
        { day: "Saturday", open: "10:00 AM", close: "11:00 PM", closed: false },
        { day: "Sunday", open: "10:00 AM", close: "9:00 PM", closed: false },
      ],
    },
  },
  { timestamps: true }
);

const SiteConfig: Model<ISiteConfig> =
  mongoose.models.SiteConfig || mongoose.model<ISiteConfig>("SiteConfig", siteConfigSchema);

export default SiteConfig;
