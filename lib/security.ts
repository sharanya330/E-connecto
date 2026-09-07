import { z } from "zod";

// Sanitize string input to prevent XSS
export function sanitizeString(input: string): string {
    return input
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
        .trim();
}

// Sanitize object recursively
export function sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
            sanitized[key] = sanitizeObject(obj[key]);
        }
        return sanitized;
    }
    return obj;
}

// Validate MongoDB ObjectId
export function isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
}

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    if (!record || now > record.resetTime) {
        rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (record.count >= maxRequests) {
        return false;
    }

    record.count++;
    return true;
}

// Clean up old rate limit records periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 60000); // Clean up every minute

// Password validation
export const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number");

// Email validation
export const emailSchema = z.string().email("Invalid email address").toLowerCase();

// Prevent NoSQL injection in queries
export function sanitizeQuery(query: any): any {
    if (typeof query === 'string') {
        return query;
    }
    if (Array.isArray(query)) {
        return query.map(sanitizeQuery);
    }
    if (query && typeof query === 'object') {
        const sanitized: any = {};
        for (const key in query) {
            // Remove MongoDB operators from user input
            if (key.startsWith('$')) {
                continue;
            }
            sanitized[key] = sanitizeQuery(query[key]);
        }
        return sanitized;
    }
    return query;
}
