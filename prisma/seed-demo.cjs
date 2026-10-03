// Demo catalogue seed — idempotent, safe to re-run.
// Run: node --env-file=.env prisma/seed-demo.cjs
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient({ transactionOptions: { maxWait: 15000, timeout: 30000 } });

const categories = [
  {
    slug: "baggy-pants", name: "Baggy Pants", sortOrder: 1,
    description: "Wide-leg denim and heavyweight twill. Volume, drape and movement — the core of the SEVEN ROCK silhouette.",
    imageUrl: "/images/products/denim.webp",
  },
  {
    slug: "drop-shoulder", name: "Drop Shoulder", sortOrder: 2,
    description: "Dropped seams and boxy builds. Heavyweight fleece and cotton cut away from the body.",
    imageUrl: "/images/products/drop-shoulder-tee.webp",
  },
  {
    slug: "oversized-tees", name: "Oversized Tees", sortOrder: 3,
    description: "Boxy oversized tees in dense jersey. Structured shoulders, clean hems, zero fuss.",
    imageUrl: "/images/products/boxy-tee.webp",
  },
  {
    slug: "shirts", name: "Shirts", sortOrder: 4,
    description: "Boxy poplin shirting with a matte finish. Sharp collars, relaxed bodies.",
    imageUrl: "/images/products/poplin-shirt.webp",
  },
  {
    slug: "panjabi", name: "Panjabi", sortOrder: 5,
    description: "Minimal modern panjabi. Straight drape, mandarin collar, tonal detail.",
    imageUrl: "/images/products/panjabi.webp",
  },
  {
    slug: "jerseys", name: "Jerseys", sortOrder: 6,
    description: "Technical jerseys with fine pinstripes and rust trims. Athletic cuts, street intent.",
    imageUrl: "/images/products/jersey.webp",
  },
];

const products = [
  {
    slug: "wide-leg-baggy-denim", name: "Wide Leg Baggy Denim", sku: "SR-BAGGY-DENIM",
    category: "baggy-pants",
    shortDescription: "14oz washed indigo denim cut wide through the leg. Heavy drape, clean finish.",
    description: "The piece that started the rotation. Cut wide from the hip with a straight fall, in 14oz denim that softens without losing shape. Matte hardware, tonal stitching, reinforced hem.\n\nWear it low, wear it long — the silhouette does the work.",
    tags: ["baggy", "denim", "wide-leg", "streetwear"],
    isFeatured: true, isNewArrival: true, isBestSeller: true,
    metaTitle: "Wide Leg Baggy Denim",
    images: ["/images/products/denim.webp", "/images/products/denim-detail.webp"],
    attributes: [["Fabric", "14oz washed denim, 100% cotton"], ["Fit", "Wide leg, mid rise"], ["Care", "Cold wash inside out"], ["Origin", "Made in Bangladesh"]],
    variants: [
      { sku: "SR-BAGGY-DENIM-32", color: "Washed Indigo", size: "32", price: 349000, compareAtPrice: 420000, onHand: null },
      { sku: "SR-BAGGY-DENIM-34", color: "Washed Indigo", size: "34", price: 349000, compareAtPrice: 420000, onHand: 10 },
    ],
  },
  {
    slug: "heavy-baggy-cargo", name: "Heavy Baggy Cargo", sku: "SR-CARGO-STONE",
    category: "baggy-pants",
    shortDescription: "Stone-grey heavyweight twill with clean minimal utility pockets.",
    description: "Utility, edited down. Heavy twill holds a wide structured silhouette while the minimal flap pockets keep the line clean. Adjustable hem, tonal hardware.",
    tags: ["cargo", "baggy", "twill", "utility"],
    isFeatured: false, isNewArrival: true, isBestSeller: false,
    images: ["/images/products/cargo.webp", "/images/products/cargo-detail.webp"],
    attributes: [["Fabric", "Heavy cotton twill"], ["Fit", "Baggy, relaxed"], ["Pockets", "Two flap, two welt"], ["Origin", "Made in Bangladesh"]],
    variants: [
      { sku: "SR-CARGO-STONE-30", color: "Stone Grey", size: "30", price: 289000, onHand: 9 },
      { sku: "SR-CARGO-STONE-32", color: "Stone Grey", size: "32", price: 289000, onHand: 12 },
      { sku: "SR-CARGO-STONE-34", color: "Stone Grey", size: "34", price: 289000, onHand: 8 },
    ],
  },
  {
    slug: "drop-shoulder-tee", name: "Drop Shoulder Tee", sku: "SR-DROPTEE-BLK",
    category: "drop-shoulder",
    shortDescription: "240 GSM washed cotton with a deep dropped shoulder. Off black.",
    description: "The foundation piece. 240 GSM washed cotton, garment dyed for a matte depth of color, with a dropped shoulder that sits exactly where it should. Ribbed collar that keeps its shape.",
    tags: ["t-shirt", "drop-shoulder", "oversized", "basic"],
    isFeatured: true, isNewArrival: true, isBestSeller: true,
    images: ["/images/products/drop-shoulder-tee.webp", "/images/products/drop-shoulder-tee-detail.webp"],
    attributes: [["Fabric", "240 GSM combed cotton"], ["Fit", "Drop shoulder, boxy"], ["Dye", "Garment dyed"], ["Origin", "Made in Bangladesh"]],
    variants: [
      { sku: "SR-DROPTEE-BLK-M", color: "Off Black", size: "M", price: 129000, onHand: 14 },
      { sku: "SR-DROPTEE-BLK-L", color: "Off Black", size: "L", price: 129000, onHand: 16 },
      { sku: "SR-DROPTEE-BLK-XL", color: "Off Black", size: "XL", price: 129000, onHand: 9 },
      { sku: "SR-DROPTEE-BONE-M", color: "Bone", size: "M", price: 129000, onHand: 11 },
      { sku: "SR-DROPTEE-BONE-L", color: "Bone", size: "L", price: 129000, onHand: 10 },
    ],
  },
  {
    slug: "boxy-oversized-tee", name: "Boxy Oversized Tee", sku: "SR-BOXYTEE-GRY",
    category: "oversized-tees",
    shortDescription: "Square-cut dense jersey with a straight hem. Bone grey.",
    description: "A perfect square. Dense jersey cut with a wide body, straight hem and structured shoulders. Falls clean over baggy denim or alone.",
    tags: ["t-shirt", "boxy", "oversized"],
    isFeatured: false, isNewArrival: true, isBestSeller: false,
    images: ["/images/products/boxy-tee.webp", "/images/products/boxy-tee-detail.webp"],
    attributes: [["Fabric", "220 GSM cotton jersey"], ["Fit", "Boxy, square hem"], ["Origin", "Made in Bangladesh"]],
    variants: [
      { sku: "SR-BOXYTEE-GRY-M", color: "Bone Grey", size: "M", price: 119000, compareAtPrice: 149000, onHand: 13 },
      { sku: "SR-BOXYTEE-GRY-L", color: "Bone Grey", size: "L", price: 119000, compareAtPrice: 149000, onHand: 15 },
      { sku: "SR-BOXYTEE-GRY-XL", color: "Bone Grey", size: "XL", price: 119000, compareAtPrice: 149000, onHand: 7 },
    ],
  },
  {
    slug: "structured-hoodie", name: "Structured Hoodie", sku: "SR-HOODIE-CHR",
    category: "drop-shoulder",
    shortDescription: "400 GSM brushed fleece, double-layer hood, dropped shoulders.",
    description: "Weight you can feel. 400 GSM brushed fleece with a structured double-layer hood that stands on its own, dropped shoulders and a dense, sculptural body.",
    tags: ["hoodie", "fleece", "oversized", "streetwear"],
    isFeatured: true, isNewArrival: false, isBestSeller: true,
    images: ["/images/products/hoodie.webp", "/images/products/hoodie-detail.webp"],
    attributes: [["Fabric", "400 GSM brushed fleece"], ["Hood", "Double layer, structured"], ["Fit", "Drop shoulder"], ["Origin", "Made in Bangladesh"]],
    variants: [
      { sku: "SR-HOODIE-CHR-M", color: "Deep Charcoal", size: "M", price: 239000, onHand: 12 },
      { sku: "SR-HOODIE-CHR-L", color: "Deep Charcoal", size: "L", price: 239000, onHand: 14 },
      { sku: "SR-HOODIE-CHR-XL", color: "Deep Charcoal", size: "XL", price: 239000, onHand: 6 },
    ],
  },
  {
    slug: "boxy-poplin-shirt", name: "Boxy Poplin Shirt", sku: "SR-POPLIN-BONE",
    category: "shirts",
    shortDescription: "Crisp matte cotton poplin, boxy body, sharp collar.",
    description: "Shirting, rebuilt. Crisp cotton poplin with a matte finish, cut boxy through the body with a sharp collar and clean placket. Works buttoned, open or layered.",
    tags: ["shirt", "poplin", "boxy"],
    isFeatured: true, isNewArrival: false, isBestSeller: false,
    images: ["/images/products/poplin-shirt.webp", "/images/products/poplin-detail.webp"],
    attributes: [["Fabric", "Cotton poplin, matte finish"], ["Fit", "Boxy, relaxed"], ["Buttons", "Matte tonal"], ["Origin", "Made in Bangladesh"]],
    variants: [
      { sku: "SR-POPLIN-BONE-M", color: "Bone White", size: "M", price: 219000, onHand: 10 },
      { sku: "SR-POPLIN-BONE-L", color: "Bone White", size: "L", price: 219000, onHand: 11 },
      { sku: "SR-POPLIN-BONE-XL", color: "Bone White", size: "XL", price: 219000, onHand: 5 },
    ],
  },
  {
    slug: "minimal-panjabi", name: "Minimal Panjabi", sku: "SR-PANJABI-CHR",
    category: "panjabi",
    shortDescription: "Charcoal cotton panjabi with mandarin collar and tonal placket detail.",
    description: "Tradition, edited. A straight-drape cotton panjabi in deep charcoal with a clean mandarin collar and subtle tonal embroidery at the placket. Quiet, precise, modern.",
    tags: ["panjabi", "ethnic", "minimal"],
    isFeatured: true, isNewArrival: true, isBestSeller: false,
    images: ["/images/products/panjabi.webp", "/images/products/panjabi-detail.webp"],
    attributes: [["Fabric", "Cotton, breathable weave"], ["Collar", "Mandarin"], ["Detail", "Tonal placket embroidery"], ["Origin", "Made in Bangladesh"]],
    variants: [
      { sku: "SR-PANJABI-CHR-M", color: "Charcoal", size: "M", price: 329000, onHand: 9 },
      { sku: "SR-PANJABI-CHR-L", color: "Charcoal", size: "L", price: 329000, onHand: 12 },
      { sku: "SR-PANJABI-CHR-XL", color: "Charcoal", size: "XL", price: 329000, onHand: 7 },
    ],
  },
  {
    slug: "technical-jersey", name: "Technical Jersey", sku: "SR-JERSEY-GRY",
    category: "jerseys",
    shortDescription: "Fine pinstripe technical fabric with rust collar trim. Athletic cut.",
    description: "Pitch to pavement. Fine tonal pinstripes on a technical knit, rust-orange trim at the collar, and a relaxed athletic cut that moves with you.",
    tags: ["jersey", "sports", "technical"],
    isFeatured: false, isNewArrival: true, isBestSeller: true,
    images: ["/images/products/jersey.webp", "/images/products/jersey-detail.webp"],
    attributes: [["Fabric", "Technical knit, breathable"], ["Trim", "Rust collar accent"], ["Fit", "Athletic relaxed"], ["Origin", "Made in Bangladesh"]],
    variants: [
      { sku: "SR-JERSEY-GRY-S", color: "Graphite", size: "S", price: 179000, compareAtPrice: 219000, onHand: 0 },
      { sku: "SR-JERSEY-GRY-M", color: "Graphite", size: "M", price: 179000, compareAtPrice: 219000, onHand: 12 },
      { sku: "SR-JERSEY-GRY-L", color: "Graphite", size: "L", price: 179000, compareAtPrice: 219000, onHand: 10 },
    ],
  },
];

async function main() {
  const categoryIds = {};
  for (const category of categories) {
    const record = await db.category.upsert({
      where: { slug: category.slug },
      create: category,
      update: { name: category.name, description: category.description, imageUrl: category.imageUrl, sortOrder: category.sortOrder, isVisible: true },
    });
    categoryIds[category.slug] = record.id;
    console.log("category:", record.slug);
  }

  for (const product of products) {
    const categoryId = categoryIds[product.category];
    const { images, attributes, variants, category, ...productData } = product;
    const record = await db.product.upsert({
      where: { slug: product.slug },
      create: { ...productData, categoryId },
      update: { ...productData, categoryId, status: "ACTIVE" },
    });

    await db.productImage.deleteMany({ where: { productId: record.id } });
    let sortOrder = 0;
    for (const url of images) {
      await db.productImage.create({ data: { productId: record.id, url, alt: product.name, sortOrder, isPrimary: sortOrder === 0 } });
      sortOrder++;
    }

    await db.productAttribute.deleteMany({ where: { productId: record.id } });
    for (const [name, value] of attributes) {
      await db.productAttribute.upsert({ where: { productId_name: { productId: record.id, name } }, create: { productId: record.id, name, value }, update: { value } });
    }

    for (const variant of variants) {
      const { onHand, ...variantData } = variant;
      const variantRecord = await db.productVariant.upsert({
        where: { sku: variant.sku },
        create: { ...variantData, productId: record.id, isActive: true },
        update: { ...variantData, productId: record.id, isActive: true },
      });
      if (onHand !== null) {
        const existing = await db.inventoryItem.findUnique({ where: { variantId: variantRecord.id } });
        if (!existing) {
          await db.inventoryItem.create({ data: { variantId: variantRecord.id, onHand } });
        }
      }
    }
    console.log("product:", record.slug);
  }

  const counts = {
    categories: await db.category.count(),
    products: await db.product.count(),
    variants: await db.productVariant.count(),
    images: await db.productImage.count(),
  };
  console.log("seeded:", JSON.stringify(counts));
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => db.$disconnect());
