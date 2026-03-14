import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IPayment extends Document {
  transactionId: string;
  order: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  amount: number;
  status: "Completed" | "Pending" | "Failed" | "Refunded";
  method: string;
  methodType: "automatic" | "manual";
  cardLast4?: string;
  referenceNumber?: string;
  receiptImage?: string;
  approvedBy?: mongoose.Types.ObjectId;
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Completed", "Pending", "Failed", "Refunded"],
      default: "Pending",
      index: true,
    },
    method: {
      type: String,
      required: true,
    },
    methodType: {
      type: String,
      enum: ["automatic", "manual"],
      default: "automatic",
    },
    cardLast4: { type: String, maxlength: 4 },
    referenceNumber: { type: String },
    receiptImage: { type: String },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    stripePaymentIntentId: { type: String },
  },
  { timestamps: true }
);

paymentSchema.index({ createdAt: -1 });

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
