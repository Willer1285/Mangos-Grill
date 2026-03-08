import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISiteConfig extends Document {
  brandName: string;
  logo?: string;
  displayMode: "logo" | "text" | "both";
  createdAt: Date;
  updatedAt: Date;
}

const siteConfigSchema = new Schema<ISiteConfig>(
  {
    brandName: { type: String, required: true, default: "Mango's Grill", trim: true },
    logo: { type: String },
    displayMode: {
      type: String,
      enum: ["logo", "text", "both"],
      default: "both",
    },
  },
  { timestamps: true }
);

const SiteConfig: Model<ISiteConfig> =
  mongoose.models.SiteConfig || mongoose.model<ISiteConfig>("SiteConfig", siteConfigSchema);

export default SiteConfig;
