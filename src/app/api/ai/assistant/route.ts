import { z } from "zod";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import {
  AiConfigurationError,
  AiProviderError,
  aiAvailability,
  aiProviderForEnvironment,
  type AiMessage,
} from "@/lib/integrations/ai";
import { getCurrentUser } from "@/modules/auth/session";
import { getShopProducts } from "@/modules/catalog/catalog.service";

const requestSchema = z.object({
  conversationId: z.string().cuid().optional(),
  message: z.string().trim().min(1).max(1_000),
});

const storedMessagesSchema = z.array(z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4_000),
})).max(100);

function storedMessages(value: unknown): AiMessage[] {
  const parsed = storedMessagesSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

function catalogueContext(products: Awaited<ReturnType<typeof getShopProducts>>["items"]) {
  if (!products.length) return "No exact live catalogue matches were found for this request.";

  return products.map((product) => {
    const price = product.variants[0]?.price;
    return `- ${product.name} | ${product.category.name} | ${price ? formatMoney(price) : "Price unavailable"} | /product/${product.slug}`;
  }).join("\n");
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 32_000) {
    return Response.json({ error: "Assistant request is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send a valid JSON request." }, { status: 400 });
  }

  const input = requestSchema.safeParse(body);
  if (!input.success) return Response.json({ error: input.error.issues[0]?.message ?? "Check the assistant message." }, { status: 400 });

  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in to use the AI assistant." }, { status: 401 });
  if (!aiAvailability().configured) return Response.json({ error: "AI assistant is not configured." }, { status: 503 });

  try {
    const existingConversation = input.data.conversationId
      ? await db.aiConversation.findFirst({ where: { id: input.data.conversationId, userId: user.id } })
      : null;
    if (input.data.conversationId && !existingConversation) {
      return Response.json({ error: "Conversation not found." }, { status: 404 });
    }

    const [settings, catalogue] = await Promise.all([
      db.storeSettings.findUnique({ where: { id: "store" }, select: { aiSystemPrompt: true } }),
      getShopProducts({ query: input.data.message, pageSize: 8 }),
    ]);
    const history = storedMessages(existingConversation?.messages).slice(-12);
    const provider = aiProviderForEnvironment();
    const completion = await provider.complete({
      systemPrompt: [
        settings?.aiSystemPrompt?.trim(),
        "You are SEVEN ROCK's Bengali fashion shopping assistant. Use only the live catalogue context for product names, prices, availability, and links. Never invent a product, price, discount, stock level, or policy. If the requested item is absent from the context, say that clearly and recommend standard catalogue search.",
        `Live catalogue context:\n${catalogueContext(catalogue.items)}`,
      ].filter(Boolean).join("\n\n"),
      messages: [...history, { role: "user", content: input.data.message }],
    });
    const messages = [
      ...history,
      { role: "user" as const, content: input.data.message },
      { role: "assistant" as const, content: completion.content },
    ].slice(-20);
    const conversation = existingConversation
      ? await db.aiConversation.update({ where: { id: existingConversation.id }, data: { messages } })
      : await db.aiConversation.create({ data: { userId: user.id, messages } });

    return Response.json({
      conversationId: conversation.id,
      message: completion.content,
      products: catalogue.items.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.variants[0]?.price ?? null,
        imageUrl: product.images[0]?.url ?? null,
      })),
    });
  } catch (error) {
    if (error instanceof AiConfigurationError) {
      return Response.json({ error: "AI assistant is not configured." }, { status: 503 });
    }
    if (error instanceof AiProviderError) {
      return Response.json({ error: "AI assistant is temporarily unavailable." }, { status: 502 });
    }
    return Response.json({ error: "Unable to process the assistant request." }, { status: 500 });
  }
}
