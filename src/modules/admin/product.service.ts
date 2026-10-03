import { db } from "@/lib/db";

export type ProductEditorInput = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  shortDescription?: string;
  description: string;
  tags: string[];
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  metaTitle?: string;
  metaDescription?: string;
  imageUrls: string[];
  attributes: { name: string; value: string }[];
  variants: { id?: string; sku: string; color?: string; size?: string; price: number; compareAtPrice?: number | null; costPrice?: number | null; stock: number; reorderLevel: number; isActive: boolean }[];
};

function productData(input: ProductEditorInput) {
  return {
    name: input.name,
    slug: input.slug,
    sku: input.sku,
    categoryId: input.categoryId,
    shortDescription: input.shortDescription || null,
    description: input.description,
    tags: input.tags,
    status: input.status,
    isFeatured: input.isFeatured,
    isNewArrival: input.isNewArrival,
    isBestSeller: input.isBestSeller,
    metaTitle: input.metaTitle || null,
    metaDescription: input.metaDescription || null,
  };
}

export async function createProduct(input: ProductEditorInput) {
  return db.product.create({
    data: {
      ...productData(input),
      images: { create: input.imageUrls.map((url, index) => ({ url, sortOrder: index, isPrimary: index === 0 })) },
      attributes: { create: input.attributes },
      variants: {
        create: input.variants.map((variant) => ({
          sku: variant.sku,
          color: variant.color || null,
          size: variant.size || null,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice || null,
          costPrice: variant.costPrice || null,
          isActive: variant.isActive,
          inventory: { create: { onHand: variant.stock, reorderLevel: variant.reorderLevel } },
        })),
      },
    },
  });
}

export async function updateProduct(input: ProductEditorInput) {
  if (!input.id) throw new Error("Product id is required.");

  return db.$transaction(async (tx) => {
    const product = await tx.product.update({ where: { id: input.id }, data: productData(input) });
    await tx.productImage.deleteMany({ where: { productId: product.id } });
    await tx.productImage.createMany({ data: input.imageUrls.map((url, index) => ({ productId: product.id, url, sortOrder: index, isPrimary: index === 0 })) });
    await tx.productAttribute.deleteMany({ where: { productId: product.id } });
    if (input.attributes.length) await tx.productAttribute.createMany({ data: input.attributes.map((attribute) => ({ ...attribute, productId: product.id })) });

    for (const variant of input.variants) {
      if (variant.id) {
        const existingVariant = await tx.productVariant.findFirst({ where: { id: variant.id, productId: product.id } });
        if (!existingVariant) throw new Error("Product variant not found.");
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            sku: variant.sku,
            color: variant.color || null,
            size: variant.size || null,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice || null,
            costPrice: variant.costPrice || null,
            isActive: variant.isActive,
            inventory: { update: { reorderLevel: variant.reorderLevel } },
          },
        });
      } else {
        await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: variant.sku,
            color: variant.color || null,
            size: variant.size || null,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice || null,
            costPrice: variant.costPrice || null,
            isActive: variant.isActive,
            inventory: { create: { onHand: variant.stock, reorderLevel: variant.reorderLevel } },
          },
        });
      }
    }
    return product;
  });
}
