import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IDeliveryOption {
  name: string;
  time: string;
  hasFee: boolean;
  price: number;
  enabled: boolean;
}

export interface IPaymentMethodField {
  label: string;
  value: string;
}

export interface IPaymentMethodConfig {
  id: string;
  name: string;
  enabled: boolean;
  type: "automatic" | "manual";
  fields?: IPaymentMethodField[];
}

export interface ISiteConfig extends Document {
  brandName: string;
  logo?: string;
  logoDark?: string;
  logoSize: number;
  displayMode: "logo" | "text" | "both";
  homepageReviewsCount: number;
  currency: string;
  timezone: string;
  deliveryOptions: IDeliveryOption[];
  paymentMethods: IPaymentMethodConfig[];
  createdAt: Date;
  updatedAt: Date;
}

const deliveryOptionSchema = new Schema<IDeliveryOption>(
  {
    name: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    hasFee: { type: Boolean, default: false },
    price: { type: Number, default: 0, min: 0 },
    enabled: { type: Boolean, default: true },
  },
  { _id: true }
);

const paymentMethodFieldSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const paymentMethodConfigSchema = new Schema<IPaymentMethodConfig>(
  {
    id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    enabled: { type: Boolean, default: true },
    type: { type: String, enum: ["automatic", "manual"], default: "automatic" },
    fields: { type: [paymentMethodFieldSchema], default: [] },
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
    currency: { type: String, default: "USD", trim: true },
    timezone: { type: String, default: "America/New_York", trim: true },
    deliveryOptions: {
      type: [deliveryOptionSchema],
      default: [
        { name: "Standard (Free)", time: "30-45 min", hasFee: false, price: 0, enabled: true },
        { name: "Express", time: "15-20 min", hasFee: true, price: 12.99, enabled: true },
      ],
    },
    paymentMethods: {
      type: [paymentMethodConfigSchema],
      default: [
        { id: "stripe", name: "Stripe", enabled: true, type: "automatic", fields: [] },
        { id: "cash", name: "Cash", enabled: true, type: "automatic", fields: [] },
      ],
    },
  },
  { timestamps: true }
);

const SiteConfig: Model<ISiteConfig> =
  mongoose.models.SiteConfig || mongoose.model<ISiteConfig>("SiteConfig", siteConfigSchema);

export default SiteConfig;
