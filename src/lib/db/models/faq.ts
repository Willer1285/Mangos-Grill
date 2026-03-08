import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IFAQ extends Document {
  question: { en: string; es: string };
  answer: { en: string; es: string };
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new Schema<IFAQ>(
  {
    question: {
      en: { type: String, required: true, trim: true },
      es: { type: String, default: "", trim: true },
    },
    answer: {
      en: { type: String, required: true, trim: true },
      es: { type: String, default: "", trim: true },
    },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const FAQ: Model<IFAQ> =
  mongoose.models.FAQ || mongoose.model<IFAQ>("FAQ", faqSchema);

export default FAQ;
