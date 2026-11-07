/** Placeholder used when the original storefront serves a broken image URL. */
export const FALLBACK_IMAGE = "/images/placeholder.svg";

/**
 * Swaps a broken image for the placeholder without looping when the placeholder itself
 * is missing.
 */
export function handleImageError(event: { currentTarget: HTMLImageElement }): void {
  const image = event.currentTarget;
  if (image.src.endsWith(FALLBACK_IMAGE)) return;
  image.src = FALLBACK_IMAGE;
}
