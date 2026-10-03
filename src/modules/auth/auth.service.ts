import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "./password";

export async function registerCustomer(input: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}) {
  const existingUser = await db.user.findUnique({ where: { email: input.email } });
  if (existingUser) throw new Error("An account already exists for this email.");

  return db.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      passwordHash: await hashPassword(input.password),
      role: Role.CUSTOMER,
    },
  });
}

export async function authenticateCustomer(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return null;
  return (await verifyPassword(password, user.passwordHash)) ? user : null;
}
