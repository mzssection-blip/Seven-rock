import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { PaymentConfigurationError, paymentProviderFor } from "@/lib/integrations/payment";

const paymentMethods = {
  bkash: PaymentMethod.BKASH,
  nagad: PaymentMethod.NAGAD,
  online: PaymentMethod.ONLINE,
} as const;

const allowedTransitions: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.PENDING]: [PaymentStatus.PAID, PaymentStatus.FAILED],
  [PaymentStatus.AUTHORIZED]: [PaymentStatus.PAID, PaymentStatus.FAILED],
  [PaymentStatus.PAID]: [PaymentStatus.REFUNDED],
  [PaymentStatus.FAILED]: [],
  [PaymentStatus.REFUNDED]: [],
};

type WebhookContext = { params: Promise<{ provider: string }> };

type WebhookOutcome =
  | { kind: "not-found" }
  | { kind: "provider-mismatch" }
  | { kind: "invalid-transition" }
  | { kind: "processed"; updated: boolean };

export async function POST(request: Request, { params }: WebhookContext) {
  const { provider: providerName } = await params;
  const method = paymentMethods[providerName.toLowerCase() as keyof typeof paymentMethods];
  if (!method) return Response.json({ error: "Payment provider not found." }, { status: 404 });

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 1_000_000) {
    return Response.json({ error: "Webhook payload is too large." }, { status: 413 });
  }

  const payload = await request.text();
  if (!payload) return Response.json({ error: "Webhook payload is required." }, { status: 400 });

  let verification: { providerReference: string; status: "PAID" | "FAILED" | "REFUNDED" };
  try {
    verification = await paymentProviderFor(method).verifyWebhook(
      payload,
      request.headers.get("x-payment-signature") ?? request.headers.get("x-signature"),
    );
  } catch (error) {
    if (error instanceof PaymentConfigurationError) {
      return Response.json({ error: "Payment webhook is not configured." }, { status: 503 });
    }
    return Response.json({ error: "Webhook verification failed." }, { status: 401 });
  }

  const targetStatus = PaymentStatus[verification.status];
  const outcome = await db.$transaction(async (tx): Promise<WebhookOutcome> => {
    const attempt = await tx.paymentAttempt.findUnique({
      where: { providerRef: verification.providerReference },
      include: { order: true },
    });
    if (!attempt) return { kind: "not-found" };
    if (attempt.provider !== method) return { kind: "provider-mismatch" };
    if (attempt.status === targetStatus) return { kind: "processed", updated: false };
    if (!allowedTransitions[attempt.status].includes(targetStatus)) return { kind: "invalid-transition" };

    await tx.paymentAttempt.update({ where: { id: attempt.id }, data: { status: targetStatus } });
    await tx.order.update({ where: { id: attempt.orderId }, data: { paymentStatus: targetStatus } });
    await tx.auditLog.create({
      data: {
        action: "payment.webhook_processed",
        entity: "PaymentAttempt",
        entityId: attempt.id,
        metadata: { provider: method, paymentStatus: targetStatus },
      },
    });
    await tx.outboxEvent.create({
      data: {
        type: "payment.status_updated",
        payload: { orderId: attempt.orderId, orderNumber: attempt.order.number, paymentStatus: targetStatus },
      },
    });
    return { kind: "processed", updated: true };
  });

  if (outcome.kind === "not-found") return Response.json({ error: "Payment attempt not found." }, { status: 404 });
  if (outcome.kind === "provider-mismatch") return Response.json({ error: "Payment provider mismatch." }, { status: 400 });
  if (outcome.kind === "invalid-transition") return Response.json({ error: "Payment status transition is not allowed." }, { status: 409 });

  return Response.json({ received: true, updated: outcome.updated });
}
