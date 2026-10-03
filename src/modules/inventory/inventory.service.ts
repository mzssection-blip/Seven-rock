import { InventoryReason, Prisma } from "@prisma/client";

export async function reserveInventory(
  tx: Prisma.TransactionClient,
  variantId: string,
  quantity: number,
  orderId: string,
) {
  const updated = await tx.$executeRaw(
    Prisma.sql`UPDATE "InventoryItem"
      SET "reserved" = "reserved" + ${quantity}, "updatedAt" = NOW()
      WHERE "variantId" = ${variantId} AND "onHand" - "reserved" >= ${quantity}`,
  );

  if (updated !== 1) {
    throw new Error("One or more selected variants are no longer available.");
  }

  const inventory = await tx.inventoryItem.findUniqueOrThrow({ where: { variantId } });
  await tx.inventoryAdjustment.create({
    data: {
      inventoryItemId: inventory.id,
      quantityDelta: -quantity,
      reason: InventoryReason.ORDER_PLACED,
      orderId,
    },
  });
}

export async function releaseReservedInventory(
  tx: Prisma.TransactionClient,
  variantId: string,
  quantity: number,
  orderId: string,
) {
  const inventory = await tx.inventoryItem.update({
    where: { variantId },
    data: { reserved: { decrement: quantity } },
  });

  await tx.inventoryAdjustment.create({
    data: {
      inventoryItemId: inventory.id,
      quantityDelta: quantity,
      reason: InventoryReason.ORDER_CANCELLED,
      orderId,
    },
  });
}

export async function fulfillReservedInventory(
  tx: Prisma.TransactionClient,
  variantId: string,
  quantity: number,
) {
  const updated = await tx.inventoryItem.updateMany({
    where: { variantId, reserved: { gte: quantity }, onHand: { gte: quantity } },
    data: { reserved: { decrement: quantity }, onHand: { decrement: quantity } },
  });

  if (updated.count !== 1) {
    throw new Error("Inventory reservation could not be fulfilled.");
  }
}
