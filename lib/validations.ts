import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["user", "recycler"]).default("user"),
    // Recycler specific fields
    businessName: z.string().optional(),
    phone: z.string().optional(),
    address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        pinCode: z.string(),
    }).optional(),
    ewasteTypes: z.array(z.string()).optional(),
});

export const pickupSchema = z.object({
    scheduledDate: z.string().min(1, "Date is required"),
    scheduledTime: z.string().min(1, "Time is required"),
    location: z.string().min(5, "Location is required"),
    items: z.array(z.string()).min(1, "At least one item is required"),
    weight: z.string().min(1, "Weight is required"),
    notes: z.string().optional(),
});

export const adminActionSchema = z.object({
    requestId: z.string().min(1, "Request ID is required"),
    action: z.enum(["approve", "reject"]),
});
