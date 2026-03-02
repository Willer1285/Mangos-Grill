import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IJobApplication {
  name: string;
  email: string;
  phone: string;
  experience: string;
  status: "Pending" | "Interview" | "Review" | "Accepted" | "Rejected";
  appliedAt: Date;
}

export interface IJob extends Document {
  title: string;
  department: string;
  employmentType: string;
  location: string;
  description: { en: string; es: string };
  requirements: { en: string; es: string };
  salaryMin?: number;
  salaryMax?: number;
  status: "Active" | "Draft" | "Closed";
  applications: IJobApplication[];
  postedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IJobApplication>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    experience: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Interview", "Review", "Accepted", "Rejected"],
      default: "Pending",
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    employmentType: {
      type: String,
      required: true,
      trim: true,
    },
    location: { type: String, required: true },
    description: {
      en: { type: String, required: true },
      es: { type: String, required: true },
    },
    requirements: {
      en: { type: String, required: true },
      es: { type: String, required: true },
    },
    salaryMin: { type: Number, min: 0 },
    salaryMax: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ["Active", "Draft", "Closed"],
      default: "Draft",
      index: true,
    },
    applications: [applicationSchema],
    postedAt: { type: Date },
  },
  { timestamps: true }
);

const Job: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>("Job", jobSchema);

export default Job;
