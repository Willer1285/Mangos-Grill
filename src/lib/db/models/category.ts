import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ICategory extends Document {
  name: { en: string; es: string };
  description: { en: string; es: string };
  image?: string;
  status: "Active" | "Inactive";
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      en: { type: String, required: true, trim: true },
      es: { type: String, required: true, trim: true },
    },
    description: {
      en: { type: String, trim: true, default: "" },
      es: { type: String, trim: true, default: "" },
    },
    image: { type: String },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.virtual("productsCount", {
  ref: "Product",
  localField: "_id",
  foreignField: "category",
  count: true,
});

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);

export default Category;
