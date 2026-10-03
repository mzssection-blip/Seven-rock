import { SettingsForm } from "@/components/admin/settings-form";
import { db } from "@/lib/db";

export default async function AdminSettingsPage() {
  const settings = await db.storeSettings.findUnique({ where: { id: "store" } });
  const socialLinks = settings && Array.isArray(settings.socialLinks) && settings.socialLinks.every((item) => typeof item === "string") ? settings.socialLinks : [];
  return <SettingsForm settings={settings ? { ...settings, socialLinks } : undefined} />;
}
