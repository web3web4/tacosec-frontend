import EthCrypto from "eth-crypto";
import { ethers } from "ethers";

/**
 * Get Ethereum PUBLIC KEY from wallet
 */
export function getPublicKey(wallet: ethers.Wallet): string {
  if (!wallet.publicKey) {
    throw new Error("Wallet does not expose publicKey");
  }

  return wallet.publicKey.slice(4); // remove 0x04
}

/**
 * Get Ethereum PRIVATE KEY from wallet
 */
export function getPrivateKey(wallet: ethers.Wallet): string {
  if (!wallet.privateKey) {
    throw new Error("Wallet does not expose privateKey");
  }

  return wallet.privateKey;
}

function getWalletFromSigner(signer: ethers.Signer): ethers.Wallet {
  if (signer instanceof ethers.Wallet) {
    return signer;
  }
  throw new Error("Signer does not expose private key");
}

/* ------------------------------------------------------------------ */
/* Encryption / Decryption                                            */
/* ------------------------------------------------------------------ */

/**
 * Encrypt secret using recipient PUBLIC KEY
 * @param secret plaintext secret
 * @param wallet ethers.Wallet (recipient)
 */
export async function encryptSecretWithPublicKey(
  secret: string,
  signer: ethers.Signer
): Promise<string> {
  try {
    const publicKey = getPublicKey(getWalletFromSigner(signer));

    const encrypted = await EthCrypto.encryptWithPublicKey(
      publicKey,
      secret
    );

    return EthCrypto.cipher.stringify(encrypted);
  } catch (error) {
    console.error("[walletCrypto] Encryption failed", error);
    throw new Error("Encryption failed");
  }
}

/**
 * Decrypt secret using wallet PRIVATE KEY
 * @param encryptedSecret encrypted payload
 * @param wallet ethers.Wallet (owner)
 */
export async function decryptSecretWithPrivateKey(
  encryptedSecret: string,
  signer: ethers.Signer
): Promise<string> {
  try {
    const privateKey = getPrivateKey(getWalletFromSigner(signer));
    const encryptedObject = EthCrypto.cipher.parse(encryptedSecret);

    return await EthCrypto.decryptWithPrivateKey(
      privateKey,
      encryptedObject
    );
  } catch (error) {
    console.error("[walletCrypto] Decryption failed", error);
    throw new Error("Decryption failed");
  }
}
