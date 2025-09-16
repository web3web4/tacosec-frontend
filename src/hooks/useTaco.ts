import {
  conditions,
  decrypt,
  Domain,
  encrypt,
  initialize,
  ThresholdMessageKit,
} from '@nucypher-experimental2/taco';
import {
  EIP4361AuthProvider,
  USER_ADDRESS_PARAM_DEFAULT,
} from '@nucypher-experimental2/taco-auth';
import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '../wallet/walletContext';
//import { useUser } from '../context/UserContext';

export default function useTaco({
  ritualId,
  domain,
  provider,
  
}: {
  ritualId: number;
  domain: Domain;
  provider: ethers.providers.JsonRpcProvider | undefined;
}) {
  const [isInit, setIsInit] = useState(false);
  const { signer  } = useWallet();
  //console.log("signer",signer);
  useEffect(() => {
    initialize().then(() => setIsInit(true));
  }, []);

  const decryptDataFromBytes = useCallback(
    async (encryptedBytes: Uint8Array) => {
      if (!isInit || !provider || !signer){
        console.warn("Taco not ready: init=", isInit, "provider=", provider, "signer=", signer); 
        return;
      }
      const messageKit = ThresholdMessageKit.fromBytes(encryptedBytes);
      const conditionContext = conditions.context.ConditionContext.fromMessageKit(messageKit);

      if (!signer || typeof signer.getAddress !== 'function') {
        console.warn("Invalid signer", signer);
        return;
      }

      const authProvider = new EIP4361AuthProvider(provider, signer, {
        domain: domain, 
        uri: 'http://localhost:3000',
      });
      console.log("signer22",signer);
      console.log("authProvider",authProvider);

      conditionContext.addAuthProvider(USER_ADDRESS_PARAM_DEFAULT, authProvider);

      return decrypt(provider, domain, messageKit, conditionContext);
    },
    [isInit, provider, domain, signer],
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