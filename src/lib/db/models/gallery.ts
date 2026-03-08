import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IGallery extends Document {
  image: string;
  caption?: string;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const gallerySchema = new Schema<IGallery>(
  {
    image: { type: String, required: true },
    caption: { type: String, trim: true },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Gallery: Model<IGallery> =
  mongoose.models.Gallery || mongoose.model<IGallery>("Gallery", gallerySchema);

export default Gallery;
