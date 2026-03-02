import { z } from "zod/v4";

export const contactSchema = z.object({
  email: z.email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export const newsletterSchema = z.object({
  email: z.email("Invalid email address"),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
