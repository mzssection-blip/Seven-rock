"use server";

import { InventoryReason, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  categoryInputSchema,
  couponInputSchema,
  inventoryAdjustmentSchema,
  orderStatusSchema,
  productInputSchema,
  storeSettingsSchema,
  variantInputSchema,
} from "@/lib/validation";
import { db } from "@/lib/db";
import { createProduct, updateProduct } from "@/modules/admin/product.service";
import { requireAdmin } from "@/modules/auth/session";
import { changeOrderStatus } from "@/modules/checkout/checkout.service";

export type AdminActionState = { error?: string; success?: string; productId?: string } | undefined;

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function integerValue(formData: FormData, key: string, fallback = 0) {
  const value = stringValue(formData, key);
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : Number.NaN;
}

function nullableIntegerValue(formData: FormData, key: string) {
  const value = stringValue(formData, key);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : Number.NaN;
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function lines(value: string) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function idList(value: string) {
  return Array.from(new Set(value.split(/[\s,]+/).map((item) => item.trim()).filter(Boolean)));
}

function actionError(error: unknown, fallback: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return "A record already uses that unique value.";
  }
  if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN"].includes(error.message)) {
    return "You do not have permission to make this change.";
  }
  if (error instanceof Error && /^(Product variant not found|A category cannot be its own parent|Category hierarchy contains a cycle|Selected parent category does not exist|Inventory cannot be reduced below reserved stock|Order not found|This order status change is not allowed)\.?$/.test(error.message)) {
    return error.message;
  }
  return fallback;
}

function dateFromInput(value: string | undefined) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

export async function saveProductAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    const admin = await requireAdmin();
    const productId = stringValue(formData, "productId");
    const parsedProduct = productInputSchema.safeParse({
      name: stringValue(formData, "name"),
      sku: stringValue(formData, "sku"),
      slug: stringValue(formData, "slug"),
      categoryId: stringValue(formData, "categoryId"),
      shortDescription: stringValue(formData, "shortDescription"),
      description: stringValue(formData, "description"),
      tags: stringValue(formData, "tags").split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean),
      status: stringValue(formData, "status"),
      isFeatured: checked(formData, "isFeatured"),
      isNewArrival: checked(formData, "isNewArrival"),
      isBestSeller: checked(formData, "isBestSeller"),
      metaTitle: stringValue(formData, "metaTitle"),
      metaDescription: stringValue(formData, "metaDescription"),
    });
    if (!parsedProduct.success) return { error: parsedProduct.error.issues[0]?.message ?? "Check the product details." };

    const imageUrls = lines(stringValue(formData, "imageUrls"));
    const images = z.array(z.string().url()).max(12).safeParse(imageUrls);
    if (!images.success) return { error: "Enter up to 12 valid image URLs." };

    const attributes = lines(stringValue(formData, "attributes")).map((line) => {
      const separator = line.indexOf(":");
      return separator === -1 ? null : { name: line.slice(0, separator).trim(), value: line.slice(separator + 1).trim() };
    });
    if (attributes.some((attribute) => !attribute?.name || !attribute.value) || new Set(attributes.map((attribute) => attribute?.name.toLowerCase())).size !== attributes.length) {
      return { error: "Attributes must use unique Name: value lines." };
    }

    let rawVariants: unknown;
    try {
      rawVariants = JSON.parse(stringValue(formData, "variants"));
    } catch {
      return { error: "Product variants could not be read." };
    }
    const variants = z.array(variantInputSchema).min(1, "Add at least one variant.").max(100).safeParse(rawVariants);
    if (!variants.success) return { error: variants.error.issues[0]?.message ?? "Check the variant details." };
    if (new Set(variants.data.map((variant) => variant.sku)).size !== variants.data.length) return { error: "Each variant must have a unique SKU." };

    const input = { ...parsedProduct.data, imageUrls: images.data, attributes: attributes as { name: string; value: string }[], variants: variants.data };
    const product = productId
      ? await updateProduct({ ...input, id: z.string().cuid().parse(productId) })
      : await createProduct(input);

    await db.auditLog.create({ data: { userId: admin.id, action: productId ? "product.updated" : "product.created", entity: "Product", entityId: product.id } });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${product.id}`);
    revalidatePath(`/product/${product.slug}`);
    revalidatePath("/", "layout");
    return { success: "Product saved.", productId: product.id };
  } catch (error) {
    return { error: actionError(error, "Unable to save the product.") };
  }
}

async function validateCategoryParent(id: string | undefined, parentId: string | undefined) {
  if (!parentId) return;
  if (id === parentId) throw new Error("A category cannot be its own parent.");

  let currentId: string | null = parentId;
  const visited = new Set<string>();
  while (currentId) {
    if (currentId === id) throw new Error("Category hierarchy contains a cycle.");
    if (visited.has(currentId)) throw new Error("Category hierarchy contains a cycle.");
    visited.add(currentId);
    const parentCategory: { parentId: string | null } | null = await db.category.findUnique({ where: { id: currentId }, select: { parentId: true } });
    if (!parentCategory) throw new Error("Selected parent category does not exist.");
    currentId = parentCategory.parentId;
  }
}

export async function saveCategoryAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    const admin = await requireAdmin();
    const parsed = categoryInputSchema.safeParse({
      id: stringValue(formData, "id") || undefined,
      name: stringValue(formData, "name"),
      slug: stringValue(formData, "slug"),
      description: stringValue(formData, "description"),
      imageUrl: stringValue(formData, "imageUrl"),
      parentId: stringValue(formData, "parentId"),
      sortOrder: integerValue(formData, "sortOrder"),
      isVisible: checked(formData, "isVisible"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the category details." };

    await validateCategoryParent(parsed.data.id, parsed.data.parentId || undefined);
    const categoryData = {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl || null,
      parentId: parsed.data.parentId || null,
      sortOrder: parsed.data.sortOrder,
      isVisible: parsed.data.isVisible,
    };
    const category = parsed.data.id
      ? await db.category.update({ where: { id: parsed.data.id }, data: categoryData })
      : await db.category.create({ data: categoryData });
    await db.auditLog.create({ data: { userId: admin.id, action: parsed.data.id ? "category.updated" : "category.created", entity: "Category", entityId: category.id } });
    revalidatePath("/admin/categories");
    revalidatePath("/", "layout");
    return { success: "Category saved." };
  } catch (error) {
    return { error: actionError(error, "Unable to save the category.") };
  }
}

export async function adjustInventoryAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    const admin = await requireAdmin();
    const parsed = inventoryAdjustmentSchema.safeParse({
      inventoryItemId: stringValue(formData, "inventoryItemId"),
      quantityDelta: integerValue(formData, "quantityDelta"),
      note: stringValue(formData, "note"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the adjustment." };

    await db.$transaction(async (tx) => {
      const updated = await tx.$queryRaw<{ id: string }[]>(Prisma.sql`
        UPDATE "InventoryItem"
        SET "onHand" = "onHand" + ${parsed.data.quantityDelta}, "updatedAt" = NOW()
        WHERE "id" = ${parsed.data.inventoryItemId}
          AND "onHand" + ${parsed.data.quantityDelta} >= "reserved"
        RETURNING "id"
      `);
      if (updated.length !== 1) throw new Error("Inventory cannot be reduced below reserved stock.");
      await tx.inventoryAdjustment.create({
        data: {
          inventoryItemId: parsed.data.inventoryItemId,
          quantityDelta: parsed.data.quantityDelta,
          reason: InventoryReason.MANUAL_ADJUSTMENT,
          note: parsed.data.note,
          createdById: admin.id,
        },
      });
      await tx.auditLog.create({ data: { userId: admin.id, action: "inventory.adjusted", entity: "InventoryItem", entityId: parsed.data.inventoryItemId, metadata: { quantityDelta: parsed.data.quantityDelta } } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return { success: "Inventory adjusted." };
  } catch (error) {
    return { error: actionError(error, "Unable to adjust inventory.") };
  }
}

export async function changeOrderStatusAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    const admin = await requireAdmin();
    const orderId = z.string().cuid().safeParse(stringValue(formData, "orderId"));
    const status = orderStatusSchema.safeParse(stringValue(formData, "status"));
    const note = z.string().trim().max(500).safeParse(stringValue(formData, "note"));
    if (!orderId.success || !status.success || !note.success) return { error: "Check the order update." };

    await changeOrderStatus({ orderId: orderId.data, toStatus: status.data, changedById: admin.id, note: note.data || undefined });
    await db.auditLog.create({ data: { userId: admin.id, action: "order.status_changed", entity: "Order", entityId: orderId.data, metadata: { status: status.data } } });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId.data}`);
    revalidatePath("/account/orders");
    return { success: "Order status updated." };
  } catch (error) {
    return { error: actionError(error, "Unable to update the order.") };
  }
}

export async function saveCouponAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    const admin = await requireAdmin();
    const parsed = couponInputSchema.safeParse({
      id: stringValue(formData, "id") || undefined,
      code: stringValue(formData, "code").toUpperCase(),
      type: stringValue(formData, "type"),
      value: integerValue(formData, "value"),
      minimumOrder: nullableIntegerValue(formData, "minimumOrder"),
      maximumDiscount: nullableIntegerValue(formData, "maximumDiscount"),
      startsAt: stringValue(formData, "startsAt"),
      expiresAt: stringValue(formData, "expiresAt"),
      usageLimit: nullableIntegerValue(formData, "usageLimit"),
      perUserLimit: nullableIntegerValue(formData, "perUserLimit"),
      isActive: checked(formData, "isActive"),
      productIds: idList(stringValue(formData, "productIds")),
      categoryIds: idList(stringValue(formData, "categoryIds")),
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the coupon details." };

    const couponData = {
      code: parsed.data.code,
      type: parsed.data.type,
      value: parsed.data.value,
      minimumOrder: parsed.data.minimumOrder || null,
      maximumDiscount: parsed.data.maximumDiscount || null,
      startsAt: dateFromInput(parsed.data.startsAt),
      expiresAt: dateFromInput(parsed.data.expiresAt),
      usageLimit: parsed.data.usageLimit || null,
      perUserLimit: parsed.data.perUserLimit || null,
      isActive: parsed.data.isActive,
      productLinks: { create: parsed.data.productIds.map((productId) => ({ productId })) },
      categoryLinks: { create: parsed.data.categoryIds.map((categoryId) => ({ categoryId })) },
    };
    const coupon = parsed.data.id
      ? await db.coupon.update({
          where: { id: parsed.data.id },
          data: {
            ...couponData,
            productLinks: { deleteMany: {}, create: couponData.productLinks.create },
            categoryLinks: { deleteMany: {}, create: couponData.categoryLinks.create },
          },
        })
      : await db.coupon.create({ data: couponData });
    await db.auditLog.create({ data: { userId: admin.id, action: parsed.data.id ? "coupon.updated" : "coupon.created", entity: "Coupon", entityId: coupon.id } });
    revalidatePath("/admin/coupons");
    revalidatePath("/cart");
    return { success: "Coupon saved." };
  } catch (error) {
    return { error: actionError(error, "Unable to save the coupon.") };
  }
}

export async function saveSettingsAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    const admin = await requireAdmin();
    const parsed = storeSettingsSchema.safeParse({
      storeName: stringValue(formData, "storeName"),
      contactEmail: stringValue(formData, "contactEmail"),
      contactPhone: stringValue(formData, "contactPhone"),
      logoUrl: stringValue(formData, "logoUrl"),
      defaultMetaTitle: stringValue(formData, "defaultMetaTitle"),
      defaultMetaDescription: stringValue(formData, "defaultMetaDescription"),
      aiProvider: stringValue(formData, "aiProvider"),
      aiModel: stringValue(formData, "aiModel"),
      aiSystemPrompt: stringValue(formData, "aiSystemPrompt"),
      socialLinks: lines(stringValue(formData, "socialLinks")),
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the store settings." };

    await db.storeSettings.upsert({
      where: { id: "store" },
      create: { id: "store", currency: "BDT", ...parsed.data, contactEmail: parsed.data.contactEmail || null, contactPhone: parsed.data.contactPhone || null, logoUrl: parsed.data.logoUrl || null, defaultMetaTitle: parsed.data.defaultMetaTitle || null, defaultMetaDescription: parsed.data.defaultMetaDescription || null, aiProvider: parsed.data.aiProvider || null, aiModel: parsed.data.aiModel || null, aiSystemPrompt: parsed.data.aiSystemPrompt || null },
      update: { ...parsed.data, contactEmail: parsed.data.contactEmail || null, contactPhone: parsed.data.contactPhone || null, logoUrl: parsed.data.logoUrl || null, defaultMetaTitle: parsed.data.defaultMetaTitle || null, defaultMetaDescription: parsed.data.defaultMetaDescription || null, aiProvider: parsed.data.aiProvider || null, aiModel: parsed.data.aiModel || null, aiSystemPrompt: parsed.data.aiSystemPrompt || null },
    });
    await db.auditLog.create({ data: { userId: admin.id, action: "settings.updated", entity: "StoreSettings", entityId: "store" } });
    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
    return { success: "Store settings saved." };
  } catch (error) {
    return { error: actionError(error, "Unable to save the store settings.") };
  }
}
