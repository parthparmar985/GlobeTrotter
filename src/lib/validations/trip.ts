// src/lib/validations/trip.ts
import { z } from "zod";

export const tripSchema = z
  .object({
    name: z.string().min(2, "Trip name must be at least 2 characters").max(100),
    description: z.string().max(1000).optional(),
    coverPhoto: z.string().url().optional().or(z.literal("")),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export type TripFormValues = z.infer<typeof tripSchema>;