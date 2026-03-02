import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type:
    | "order_confirmed"
    | "order_update"
    | "order_delivered"
    | "promo"
    | "reservation_reminder"
    | "reservation_confirmed"
    | "rate_order"
    | "payment_approved"
    | "payment_failed";
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "order_confirmed",
        "order_update",
        "order_delivered",
        "promo",
        "reservation_reminder",
        "reservation_confirmed",
        "rate_order",
        "payment_approved",
        "payment_failed",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
