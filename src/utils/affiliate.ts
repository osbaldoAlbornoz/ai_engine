export const DEFAULT_AFFILIATE_TAG =
  process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || "theaienginela-20";

/**
 * Ensures any Amazon URL dynamically carries the site's affiliate tag.
 */
export function getAffiliateUrl(
  rawUrl?: string | null,
  tag: string = DEFAULT_AFFILIATE_TAG
): string {
  if (!rawUrl || typeof rawUrl !== "string" || rawUrl === "#") {
    return "#";
  }

  try {
    const urlObj = new URL(rawUrl);
    if (
      urlObj.hostname.includes("amazon.com") ||
      urlObj.hostname.includes("amzn.to")
    ) {
      urlObj.searchParams.set("tag", tag);
      return urlObj.toString();
    }
  } catch {
    if (rawUrl.includes("amazon.com") || rawUrl.includes("amzn.to")) {
      if (rawUrl.includes("tag=")) {
        return rawUrl.replace(/tag=[^&]+/, `tag=${tag}`);
      }
      const separator = rawUrl.includes("?") ? "&" : "?";
      return `${rawUrl}${separator}tag=${tag}`;
    }
  }

  return rawUrl;
}
