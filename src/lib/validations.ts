import { z } from 'zod';

export const signUpSchema = z.object({
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters').max(100),
  email: z.string().trim().email('Enter a valid email address'),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const verifyEmailSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const productStatusEnum = z.enum(['ACTIVE', 'INACTIVE']);

export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(200),
  sku: z
    .string()
    .trim()
    .min(1, 'SKU is required')
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/, 'SKU may only contain letters, numbers, hyphens and underscores'),
  price: z.coerce.number({ invalid_type_error: 'Price must be a number' }).positive('Price must be a positive number'),
  quantity: z.coerce
    .number({ invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .nonnegative('Quantity cannot be negative'),
  categoryId: z.string().trim().optional().nullable(),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  status: productStatusEnum,
  imageUrl: z.string().trim().optional().nullable(),
  warehouseLocation: z.string().trim().max(100).optional().or(z.literal('')).nullable(),
  reorderPoint: z.coerce
    .number({ invalid_type_error: 'Reorder point must be a number' })
    .int('Reorder point must be a whole number')
    .nonnegative('Reorder point cannot be negative')
    .optional()
    .nullable()
    .or(z.literal('')),
});
export type ProductFormInput = z.infer<typeof productFormSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(100),
  parentId: z.string().trim().optional().nullable().or(z.literal('')),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const quantityUpdateSchema = z.object({
  quantity: z.coerce
    .number({ invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .nonnegative('Quantity cannot be negative'),
});
export type QuantityUpdateInput = z.infer<typeof quantityUpdateSchema>;
