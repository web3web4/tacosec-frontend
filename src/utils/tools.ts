import { TelegramUser } from "../types/types";
import crypto from 'crypto';
import { ethers } from 'ethers';

export function parseTelegramInitData(initData: string){
    const params = new URLSearchParams(initData);
    const userJson = params.get("user");
    let user: TelegramUser = {} as TelegramUser;
  
    try {
      if (userJson) {
        user = JSON.parse(decodeURIComponent(userJson));
      }
    } catch (e) {
      console.error("Field To Get User Data:", e);
    }
  
    return {
      telegramId: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      authDate: params.get("auth_date"),
      hash: params.get("hash")
    };
  }

  /**
 * Turns Telegram’s init data into the three values that the contract needs.
 * Nothing here is security–critical: we only re-encode bytes the way Telegram
 * requests them.  The secret-key derivation and the final HMAC check are done
 * inside the EVM.
 */
export function prepareTelegramArgs(
  telegramInitData: string,
  botToken: string,
) {
  // 1. Decode the query string supplied by Telegram
  const decoded = decodeURIComponent(telegramInitData);
  const parts = decoded.split('&');

  // 2. Extract the “hash” field and remove it from the array
  const hashIdx = parts.findIndex((s) => s.startsWith('hash='));
  if (hashIdx === -1) throw new Error('hash field missing');
  const suppliedHashHex = parts.splice(hashIdx, 1)[0].split('=')[1];

  // 3. Alphabetical sort + join with '\n' ⇒ data-check-string
  parts.sort((a, b) => a.localeCompare(b));
  const dataCheckString = parts.join('\n');

  // 4. First HMAC: secret = HMAC_SHA256(key="WebAppData", msg=botToken)
  const secret = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest(); // Buffer length = 32

  return {
    dataCheckBytes: ethers.utils.toUtf8Bytes(dataCheckString), // calldata
    suppliedHash32: '0x' + suppliedHashHex, // bytes32
    secretKey32: ethers.utils.hexlify(secret), // bytes32
  };
}