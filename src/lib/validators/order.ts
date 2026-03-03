import { z } from "zod/v4";

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  modifiers: z.array(z.string()).optional(),
  extras: z
    .array(
      z.object({
        name: z.string(),
        price: z.number().min(0),
      })
    )
    .optional(),
});

export const shippingAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
  street: z.string().min(1, "Street address is required").max(200),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(50),
  zip: z.string().min(5, "Valid ZIP code required").max(10),
  phone: z.string().min(7, "Valid phone required").max(20),
});

export const checkoutSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Cart cannot be empty"),
  deliveryType: z.enum(["Dine-in", "Delivery", "Pickup"]),
  deliveryAddress: shippingAddressSchema.optional(),
  tableNumber: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  paymentMethod: z.string().min(1, "Payment method required"),
  tip: z.number().min(0).optional(),
  promoCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
