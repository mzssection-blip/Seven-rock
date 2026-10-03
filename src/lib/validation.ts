import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters.")
  .max(128, "Password is too long.")
  .regex(/[a-z]/, "Password needs a lowercase letter.")
  .regex(/[A-Z]/, "Password needs an uppercase letter.")
  .regex(/\d/, "Password needs a number.");

export const registrationSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.string().trim().email("Enter a valid email.").toLowerCase(),
  phone: z.string().trim().regex(/^(?:\+880|880|0)1[3-9]\d{8}$/, "Enter a valid Bangladeshi phone number.").optional().or(z.literal("")),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

export const checkoutSchema = z.object({
  recipient: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^(?:\+880|880|0)1[3-9]\d{8}$/, "Enter a valid Bangladeshi phone number."),
  email: z.string().trim().email().optional().or(z.literal("")),
  division: z.string().trim().max(80).optional().or(z.literal("")),
  district: z.string().trim().min(2).max(80),
  area: z.string().trim().min(2).max(120),
  addressLine1: z.string().trim().min(5).max(250),
  addressLine2: z.string().trim().max(250).optional().or(z.literal("")),
  paymentMethod: z.enum(["COD", "BKASH", "NAGAD", "ONLINE"]),
  couponCode: z.string().trim().max(40).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(3).max(140),
  sku: z.string().trim().min(3).max(64).toUpperCase(),
  slug: z.string().trim().min(3).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  categoryId: z.string().cuid(),
  shortDescription: z.string().trim().max(280).optional().or(z.literal("")),
  description: z.string().trim().min(10).max(10000),
  tags: z.array(z.string().trim().min(1).max(40)).max(12),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  isFeatured: z.boolean(),
  isNewArrival: z.boolean(),
  isBestSeller: z.boolean(),
  metaTitle: z.string().trim().max(70).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(160).optional().or(z.literal("")),
});

export const variantInputSchema = z
  .object({
    id: z.string().cuid().optional(),
    sku: z.string().trim().min(3).max(64).toUpperCase(),
    color: z.string().trim().max(40).optional().or(z.literal("")),
    size: z.string().trim().max(20).optional().or(z.literal("")),
    price: z.number().int().positive(),
    compareAtPrice: z.number().int().positive().nullable().optional(),
    costPrice: z.number().int().positive().nullable().optional(),
    stock: z.number().int().min(0),
    reorderLevel: z.number().int().min(0).max(10000).default(5),
    isActive: z.boolean().default(true),
  })
  .refine((variant) => !variant.compareAtPrice || variant.compareAtPrice >= variant.price, {
    message: "Compare-at price must not be lower than the selling price.",
  });

export const categoryInputSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  imageUrl: z.string().trim().url().optional().or(z.literal("")),
  parentId: z.string().cuid().optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).max(100000),
  isVisible: z.boolean(),
});

export const inventoryAdjustmentSchema = z.object({
  inventoryItemId: z.string().cuid(),
  quantityDelta: z.number().int().min(-100000).max(100000).refine((value) => value !== 0, "Enter a non-zero adjustment."),
  note: z.string().trim().min(3).max(500),
});

const dateInputSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal(""));

export const couponInputSchema = z
  .object({
    id: z.string().cuid().optional(),
    code: z.string().trim().min(3).max(40).regex(/^[A-Z0-9_-]+$/),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    value: z.number().int().positive(),
    minimumOrder: z.number().int().nonnegative().nullable().optional(),
    maximumDiscount: z.number().int().positive().nullable().optional(),
    startsAt: dateInputSchema,
    expiresAt: dateInputSchema,
    usageLimit: z.number().int().positive().nullable().optional(),
    perUserLimit: z.number().int().positive().nullable().optional(),
    isActive: z.boolean(),
    productIds: z.array(z.string().cuid()).max(100),
    categoryIds: z.array(z.string().cuid()).max(100),
  })
  .superRefine((coupon, context) => {
    if (coupon.type === "PERCENTAGE" && coupon.value > 100) {
      context.addIssue({ code: "custom", message: "Percentage discounts cannot exceed 100." });
    }
    if (coupon.startsAt && coupon.expiresAt && coupon.startsAt > coupon.expiresAt) {
      context.addIssue({ code: "custom", message: "Expiry must be after the start date." });
    }
  });

export const orderStatusSchema = z.enum(["PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"]);

export const storeSettingsSchema = z.object({
  storeName: z.string().trim().min(2).max(80),
  contactEmail: z.string().trim().email().optional().or(z.literal("")),
  contactPhone: z.string().trim().max(30).optional().or(z.literal("")),
  logoUrl: z.string().trim().url().optional().or(z.literal("")),
  defaultMetaTitle: z.string().trim().max(70).optional().or(z.literal("")),
  defaultMetaDescription: z.string().trim().max(160).optional().or(z.literal("")),
  aiProvider: z.string().trim().max(50).optional().or(z.literal("")),
  aiModel: z.string().trim().max(100).optional().or(z.literal("")),
  aiSystemPrompt: z.string().trim().max(4000).optional().or(z.literal("")),
  socialLinks: z.array(z.string().url()).max(10),
});
