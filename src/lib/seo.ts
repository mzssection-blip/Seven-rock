const fallbackSiteUrl = "http://localhost:3000";

export function siteUrl() {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL?.trim() || fallbackSiteUrl);
  } catch {
    return new URL(fallbackSiteUrl);
  }
}

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl()).toString();
}
