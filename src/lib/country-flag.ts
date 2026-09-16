/**
 * Server-safe country flag emoji. Mirrors the regional-indicator conversion
 * used by `countryFlag()` in the client `icon-picker.tsx` (UK renders as GB
 * because ISO GB is the flag emoji source of truth for the United Kingdom).
 */
export function countryFlagEmoji(code: string) {
  const emojiCode = code.toUpperCase() === "UK" ? "GB" : code.toUpperCase()
  return emojiCode.replace(/./g, (letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
}