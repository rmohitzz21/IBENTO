import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    city: z.string().min(1, 'City is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const bookingSchema = z.object({
  eventDate: z.string().min(1, 'Event date is required'),
  eventType: z.string().min(1, 'Event type is required'),
  eventAddress: z.string().min(5, 'Address is required'),
  guestCount: z.number().min(1, 'Guest count must be at least 1'),
  specialRequests: z.string().optional(),
})

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(3, 'Title is required'),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
  wouldRecommend: z.boolean(),
})

export const vendorApplicationSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  category: z.string().min(1, 'Category is required'),
  city: z.string().min(1, 'City is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  yearsOfExperience: z.number().min(0).optional(),
})
