export function shouldShowBackup(identifier: string | null, hasWallet: boolean): boolean {
  if (!identifier || !hasWallet) return false;
  return localStorage.getItem(`seedBackupDone-${identifier}`) !== "true";
}
