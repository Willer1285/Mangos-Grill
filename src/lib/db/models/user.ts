import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IAddress {
  label: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface INotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  reservationReminders: boolean;
  newsletter: boolean;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other" | "prefer-not-to-say";
  role: "SuperAdmin" | "Manager" | "Client";
  location?: string;
  status: "Active" | "Disabled";
  avatar?: string;
  provider: "credentials" | "google" | "apple";
  addresses: IAddress[];
  notificationPreferences: INotificationPreferences;
  loyaltyPoints: number;
  favorites: mongoose.Types.ObjectId[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    label: { type: String, default: "Home" },
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, default: "US" },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, trim: true },
    password: { type: String, select: false },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
    },
    role: {
      type: String,
      enum: ["SuperAdmin", "Manager", "Client"],
      default: "Client",
    },
    location: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Active", "Disabled"],
      default: "Active",
    },
    avatar: { type: String },
    provider: {
      type: String,
      enum: ["credentials", "google", "apple"],
      default: "credentials",
    },
    addresses: [addressSchema],
    notificationPreferences: {
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      reservationReminders: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false },
    },
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ role: 1, status: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
