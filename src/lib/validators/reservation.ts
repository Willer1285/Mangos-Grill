import { z } from "zod/v4";
import { OCCASIONS } from "@/lib/constants";

export const reservationSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  partySize: z.number().int().min(1, "At least 1 guest").max(20, "Maximum 20 guests"),
  tableId: z.string().optional(),
  occasion: z.enum(OCCASIONS).optional(),
  specialRequests: z.string().max(500).optional(),
  location: z.string().min(1, "Location is required"),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
