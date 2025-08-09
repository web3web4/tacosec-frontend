export function shouldShowBackup(identifier: string | null, haMetroSwallet: boolean): boolean {
  if (!identifier || !haMetroSwallet) return false;
  return localStorage.getItem(`seedBackupDone-${identifier}`) !== "true";
}
