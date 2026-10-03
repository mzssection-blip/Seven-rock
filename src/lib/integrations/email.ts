export type EmailMessage = { to: string; subject: string; html: string };

export function emailIsConfigured() {
  return Boolean(process.env.EMAIL_PROVIDER && process.env.EMAIL_API_KEY);
}

export async function sendEmail(_message: EmailMessage) {
  if (!emailIsConfigured()) {
    return { delivered: false, reason: "Email provider is not configured." };
  }

  throw new Error("Configure an email provider adapter before sending messages.");
}
