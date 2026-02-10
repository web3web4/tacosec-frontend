import { useState } from 'react';
import { fromHexString } from '@nucypher/shared';
import { fromBytes } from '@nucypher/taco';
import { createAppError, handleSilentError, config, getSecretFromCache, saveSecretToCache, encryptSecretWithPublicKey, decryptSecretWithPrivateKey } from '@/utils';
import { useWallet } from '@/wallet/walletContext';
import { useUser } from '@/context';
import { useTaco } from '@/hooks';
import { setSecretView, getSecretViews } from '@/services';
import { SecretViews } from '@/types/types';

const ritualId = config.TACO_RITUAL_ID;
const domain = config.TACO_DOMAIN;

export default function useSecretDecryption({
  setChildrenLoading,
  triggerGetChildrenForSecret,
  secretViews,
  setSecretViews,
}: {
  setChildrenLoading: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  triggerGetChildrenForSecret: (id: string) => Promise<void>;
  secretViews: Record<string, SecretViews>;
  setSecretViews: React.Dispatch<React.SetStateAction<Record<string, SecretViews>>>;
}) {
  // Parent secret decryption state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [decryptedMessages, setDecryptedMessages] = useState<Record<string, string>>({});
  const [decryptErrors, setDecryptErrors] = useState<{ [id: string]: string }>({});
  const [decrypting, setDecrypting] = useState<boolean>(false);

  // Child secret decryption state
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);
  const [decryptedChildMessages, setDecryptedChildMessages] = useState<Record<string, string>>({});
  const [decryptingChild, setDecryptingChild] = useState<boolean>(false);

  const { signer, provider } = useWallet();
  const { initDataRaw } = useUser();
  const { decryptDataFromBytes } = useTaco({ domain, provider, ritualId });

  const decryptMessage = async (id: string, encryptedText: string) => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      setDecryptErrors((prev) => ({
        ...prev,
        [id]: 'Invalid secret ID',
      }));
      setDecrypting(false);
      return;
    }

    if (!encryptedText || typeof encryptedText !== 'string' || encryptedText.trim() === '') {
      setDecryptErrors((prev) => ({
        ...prev,
        [id]: 'Invalid encrypted data',
      }));
      setDecrypting(false);
      return;
    }

    if (!provider || !signer) {
      setDecryptErrors((prev) => ({
        ...prev,
        [id]: 'Wallet not connected',
      }));
      setDecrypting(false);
      return;
    }
    try {
      setDecrypting(true);
      
      // First, check if secret is already cached
      try {
        const cachedSecret = await getSecretFromCache(id);
        if (cachedSecret) {
          const decrypted = await decryptSecretWithPrivateKey(cachedSecret, signer);
          if (decrypted) {
            setDecryptedMessages((prev) => ({ ...prev, [id]: decrypted }));
            return;
          }
        }
      } catch (cacheErr) {
        console.warn(`[Cache] Error checking cache for secret ${id}:`, cacheErr);
      }
      
      // Fallback to Taco decryption (or cache miss)
      const decryptedBytes = await decryptDataFromBytes(
        fromHexString(encryptedText)
      );
      if (decryptedBytes) {
        const decrypted = fromBytes(decryptedBytes);
        setDecryptedMessages((prev) => ({ ...prev, [id]: decrypted }));
        const encryptedForCache = await encryptSecretWithPublicKey(decrypted, signer);
        await saveSecretToCache(id, encryptedForCache);
      }
    } catch (err: unknown) {
      const appError = createAppError(err, 'unknown');
      handleSilentError(appError, 'Decrypt Message');
      setDecryptErrors((prev) => ({
        ...prev,
        [id]: appError.message,
      }));
    } finally {
      setDecrypting(false);
    }
  };

  const toggleExpand = async (value: string, id: string, isIgnored: boolean = false) => {
    setDecrypting(false);
    if (expandedId === id && !isIgnored) {
      setExpandedId(null);
    } else {
      setExpandedId(id);

      if (!decryptedMessages[id]) {
        decryptMessage(id, value);
      }
      await setSecretView(initDataRaw!, id);
      setChildrenLoading((prev) => ({ ...prev, [id]: true }));
      triggerGetChildrenForSecret(id);
      const views = await getSecretViews(initDataRaw!, id);
      setSecretViews((prev) => ({ ...prev, [id]: views }));
    }
  };

  const decryptChildMessage = async (childId: string, encryptedText: string) => {
    if (!encryptedText || !provider || !signer) return;
    try {
      setDecryptingChild(true);
      
      // First, check if secret is already cached
      try {
        const cachedSecret = await getSecretFromCache(childId);
        if (cachedSecret) {
          const decrypted = await decryptSecretWithPrivateKey(cachedSecret, signer);
          if (decrypted) {
            setDecryptedChildMessages((prev) => ({ ...prev, [childId]: decrypted }));
            if (secretViews[childId].isNewSecret) setSecretViews(prev => ({...prev, [childId]: {...prev[childId], isNewSecret: false}}));
            return;
          }
        }
      } catch (cacheErr) {
        console.warn(`[Cache] Error checking cache for child secret ${childId}:`, cacheErr);
      }
      
      // Fallback to Taco decryption (or cache miss)
      const decryptedBytes = await decryptDataFromBytes(
        fromHexString(encryptedText)
      );
      if (decryptedBytes) {
        const decrypted = fromBytes(decryptedBytes);
        setDecryptedChildMessages((prev) => ({ ...prev, [childId]: decrypted }));
        if (secretViews[childId].isNewSecret) setSecretViews(prev => ({...prev, [childId]: {...prev[childId], isNewSecret: false}}));
        const encryptedForCache = await encryptSecretWithPublicKey(decrypted, signer);
        await saveSecretToCache(childId, encryptedForCache);
      }
    } catch (e) {
      console.error("Error decrypting child:", e);
    } finally {
      setDecryptingChild(false);
    }
  };

  const toggleChildExpand = async (value: string, childId: string, isIgnored: boolean = false) => {
    setDecryptingChild(false);
    await setSecretView(initDataRaw!, childId);
    if (expandedChildId === childId && !isIgnored) {
      setExpandedChildId(null);
    } else {
      setExpandedChildId(childId);
      if (!decryptedChildMessages[childId]) {
        decryptChildMessage(childId, value);
      }
    }
  };

  return {
    // Parent decryption
    expandedId,
    setExpandedId,
    decryptedMessages,
    decryptErrors,
    decrypting,
    toggleExpand,
    // Child decryption
    expandedChildId,
    setExpandedChildId,
    decryptedChildMessages,
    decryptingChild,
    toggleChildExpand,
  };
}
