import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  modifiers: string[];
  extras: { name: string; price: number }[];
  subtotal: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  items: IOrderItem[];
  deliveryType: "Dine-in" | "Delivery" | "Pickup";
  deliveryAddress?: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  };
  tableNumber?: string;
  location: string;
  status: "New" | "Preparing" | "Ready" | "InTransit" | "Delivered" | "Cancelled";
  paymentMethod: string;
  paymentStatus: "Pending" | "Completed" | "Failed" | "Refunded";
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  shippingCost: number;
  tip: number;
  total: number;
  promoCode?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    modifiers: [{ type: String }],
    extras: [
      {
        name: { type: String },
        price: { type: Number, min: 0 },
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: { type: [orderItemSchema], required: true },
    deliveryType: {
      type: String,
      enum: ["Dine-in", "Delivery", "Pickup"],
      required: true,
    },
    deliveryAddress: {
      fullName: { type: String },
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String },
      phone: { type: String },
    },
    tableNumber: { type: String },
    location: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["New", "Preparing", "Ready", "InTransit", "Delivered", "Cancelled"],
      default: "New",
      index: true,
    },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Pending",
    },
    subtotal: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, required: true },
    shippingCost: { type: Number, default: 0, min: 0 },
    tip: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    promoCode: { type: String },
    notes: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ location: 1, status: 1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);

export default Order;
