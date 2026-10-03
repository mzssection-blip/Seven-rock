import { ProductStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const productCardInclude = {
  category: { select: { name: true, slug: true } },
  images: { orderBy: { sortOrder: "asc" }, take: 2 },
  variants: {
    where: { isActive: true },
    orderBy: { price: "asc" },
    include: { inventory: true },
  },
} satisfies Prisma.ProductInclude;

export type ProductCard = Prisma.ProductGetPayload<{ include: typeof productCardInclude }>;

export async function getFeaturedProducts(limit = 8): Promise<ProductCard[]> {
  return db.product.findMany({
    where: { status: ProductStatus.ACTIVE, isFeatured: true },
    include: productCardInclude,
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

export async function getNewArrivals(limit = 8): Promise<ProductCard[]> {
  return db.product.findMany({
    where: { status: ProductStatus.ACTIVE, isNewArrival: true },
    include: productCardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getBestSellers(limit = 8): Promise<ProductCard[]> {
  return db.product.findMany({
    where: { status: ProductStatus.ACTIVE, isBestSeller: true },
    include: productCardInclude,
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

export async function getSaleProducts(limit = 36): Promise<ProductCard[]> {
  return db.product.findMany({
    where: {
      status: ProductStatus.ACTIVE,
      variants: { some: { isActive: true, compareAtPrice: { not: null } } },
    },
    include: productCardInclude,
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

export async function getVisibleCategories() {
  return db.category.findMany({
    where: { isVisible: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({
    where: { slug, status: ProductStatus.ACTIVE },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      attributes: true,
      variants: {
        where: { isActive: true },
        include: { inventory: true },
        orderBy: [{ color: "asc" }, { size: "asc" }],
      },
      reviews: {
        where: { status: "PUBLISHED" },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 8,
      },
    },
  });
}

export async function getShopProducts(input: {
  query?: string;
  category?: string;
  sort?: "newest" | "price-asc" | "price-desc";
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(input.page ?? 1, 1);
  const pageSize = Math.min(Math.max(input.pageSize ?? 12, 1), 36);
  const filters: Prisma.ProductWhereInput = { status: ProductStatus.ACTIVE };

  if (input.category) filters.category = { slug: input.category };
  if (input.query) {
    filters.OR = [
      { name: { contains: input.query, mode: "insensitive" } },
      { sku: { contains: input.query, mode: "insensitive" } },
      { tags: { has: input.query.toLowerCase() } },
      { category: { name: { contains: input.query, mode: "insensitive" } } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    input.sort === "price-asc"
      ? { variants: { _count: "asc" } }
      : input.sort === "price-desc"
        ? { variants: { _count: "desc" } }
        : { createdAt: "desc" };

  const [items, total] = await db.$transaction([
    db.product.findMany({ where: filters, include: productCardInclude, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
    db.product.count({ where: filters }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}
