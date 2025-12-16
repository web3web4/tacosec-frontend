
export function getEncryptedSeed(identifier: string): string | null {
  return localStorage.getItem(`encryptedSeed-${identifier}`);
}

export function saveEncryptedSeed(identifier: string, encrypted: string) {
  localStorage.setItem(`encryptedSeed-${identifier}`, encrypted);
}

export function setSeedBackupDone(identifier: string, done: boolean) {
  localStorage.setItem(`seedBackupDone-${identifier}`, done.toString());
}

export function getSavedPasswordPreference(): boolean {
  return localStorage.getItem("savePasswordInBackend") === "true";
}

export function setSavedPasswordPreference(save: boolean) {
  localStorage.setItem("savePasswordInBackend", save.toString());
}

export function findAddressInStorage(): string | null {
  const keys = Object.keys(localStorage);
  const encryptedKey = keys.find((k) => k.startsWith("encryptedSeed-"));
  return encryptedKey?.split("encryptedSeed-")[1] || null;
}

export function getPublicAddressInStorage(): string | null {
  return localStorage.getItem("publicAddress");
}

export function setPublicAddressInStorage(address: string) {
  localStorage.setItem("publicAddress", address);
}

export function removeEncryptedSeed(identifier: string) {
  localStorage.removeItem(`encryptedSeed-${identifier}`);
}

export function removeSeedBackupDone(identifier: string) {
  localStorage.removeItem(`seedBackupDone-${identifier}`);
}