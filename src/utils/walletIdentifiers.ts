export function getIdentifier(
  isBrowser: boolean,
  address: string | null,
  addressweb: string | null,
  telegramId?: string
): string | null {
  return isBrowser ? (address || addressweb) : telegramId || null;
}
