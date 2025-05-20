import {
  conditions,
  decrypt,
  Domain,
  encrypt,
  initialize,
  ThresholdMessageKit,
} from '@nucypher/taco';
import {
  EIP4361AuthProvider,
} from '@nucypher/taco-auth';
import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';

export default function useTaco({
  ritualId,
  domain,
  provider,
}: {
  ritualId: number;
  domain: Domain;
  provider: ethers.providers.Provider | undefined;
}) {
  const [isInit, setIsInit] = useState(false);
  const { initDataRaw } = useUser();
  useEffect(() => {
    initialize().then(() => setIsInit(true));
  }, []);

  const decryptDataFromBytes = useCallback(
    async (encryptedBytes: Uint8Array, signer: ethers.Signer) => {
      if (!isInit || !provider) {
        return;
      }

      const messageKit = ThresholdMessageKit.fromBytes(encryptedBytes);
      const telegramConditionContext =
        conditions.context.ConditionContext.fromMessageKit(messageKit);
        const contextParams = {
          ':authorizationToken': initDataRaw!
        };
        
        telegramConditionContext.addCustomContextParameterValues(contextParams);
        return decrypt(provider, domain, messageKit, telegramConditionContext);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isInit, provider, domain],
  );

  const encryptDataToBytes = useCallback(
    async (
      message: string,
      condition: conditions.condition.Condition,
      encryptorSigner: ethers.Signer,
    ) => {
      if (!isInit || !provider) return;
      const messageKit = await encrypt(
        provider,
        domain,
        message,
        condition,
        ritualId,
        encryptorSigner,
      );
      return messageKit.toBytes();
    },
    [isInit, provider, domain, ritualId],
  );

  return {
    isInit,
    decryptDataFromBytes,
    encryptDataToBytes,
  };
}