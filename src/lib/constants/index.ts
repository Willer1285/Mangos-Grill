export const TX_TAX_RATE = Number(process.env.NEXT_PUBLIC_TX_TAX_RATE) || 0.0825;

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Mango's Grill";

export const ROLES = {
  SUPER_ADMIN: "SuperAdmin",
  STAFF: "Staff",
  CLIENT: "Client",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ORDER_STATUSES = {
  NEW: "New",
  PREPARING: "Preparing",
  READY: "Ready",
  IN_TRANSIT: "InTransit",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];

export const PAYMENT_METHODS = {
  VISA: "Visa",
  MASTERCARD: "Mastercard",
  AMEX: "Amex",
  ZELLE: "Zelle",
  BINANCE: "Binance",
  CASH: "Cash",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const PAYMENT_STATUSES = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  FAILED: "Failed",
  REFUNDED: "Refunded",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

export const RESERVATION_STATUSES = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SEATED: "Seated",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
} as const;

export type ReservationStatus =
  (typeof RESERVATION_STATUSES)[keyof typeof RESERVATION_STATUSES];

export const TABLE_STATUSES = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  RESERVED: "Reserved",
} as const;

export type TableStatus = (typeof TABLE_STATUSES)[keyof typeof TABLE_STATUSES];

export const OCCASIONS = [
  "Romantic",
  "Family",
  "Business",
  "Birthday",
  "Anniversary",
  "Wedding Anniversary",
  "Graduation",
  "Friends Gathering",
  "Baby Shower",
  "Engagement",
  "Promotion",
  "Farewell",
  "Holiday Celebration",
  "Corporate Event",
  "Baptism",
  "Date Night",
  "Retirement",
  "Casual Dining",
  "Reunion",
  "Other",
] as const;

export type Occasion = (typeof OCCASIONS)[number];

export const JOB_STATUSES = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  CLOSED: "Closed",
} as const;

export const EMPLOYMENT_TYPES = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
} as const;

export const DEPARTMENTS = [
  "Kitchen",
  "Front of House",
  "Management",
  "Operations",
] as const;
