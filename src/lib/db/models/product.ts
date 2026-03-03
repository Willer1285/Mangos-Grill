import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IModifier {
  name: { en: string; es: string };
  options: { en: string; es: string }[];
}

export interface IExtra {
  name: { en: string; es: string };
  price: number;
}

export interface INutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface IProduct extends Document {
  name: { en: string; es: string };
  slug: string;
  description: { en: string; es: string };
  price: number;
  category: mongoose.Types.ObjectId;
  image?: string;
  status: "Available" | "Unavailable";
  tags: string[];
  nutritionalInfo?: INutritionalInfo;
  ingredients: { en: string[]; es: string[] };
  modifiers: IModifier[];
  extras: IExtra[];
  locations: string[];
  hasStock: boolean;
  stock: number;
  featured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      en: { type: String, required: true, trim: true },
      es: { type: String, required: true, trim: true },
    },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: {
      en: { type: String, trim: true, default: "" },
      es: { type: String, trim: true, default: "" },
    },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    image: { type: String },
    status: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Available",
    },
    tags: [{ type: String, trim: true }],
    nutritionalInfo: {
      calories: { type: Number, min: 0 },
      protein: { type: Number, min: 0 },
      carbs: { type: Number, min: 0 },
      fat: { type: Number, min: 0 },
    },
    ingredients: {
      en: [{ type: String }],
      es: [{ type: String }],
    },
    modifiers: [
      {
        name: {
          en: { type: String },
          es: { type: String },
        },
        options: [
          {
            en: { type: String },
            es: { type: String },
          },
        ],
      },
    ],
    extras: [
      {
        name: {
          en: { type: String },
          es: { type: String },
        },
        price: { type: Number, min: 0 },
      },
    ],
    locations: [{ type: String, trim: true }],
    hasStock: { type: Boolean, default: false },
    stock: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ category: 1, status: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ tags: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export default Product;
