import { fromHexString } from '@nucypher/shared';
import { conditions, fromBytes, toHexString } from '@nucypher/taco';
//import { ethers } from 'ethers';
//import { hexlify } from 'ethers/lib/utils';
import { useState } from 'react';

import useTaco from '../../hooks/useTaco';
import { useWallet } from '../../wallet/walletContext';



const ritualId = process.env.REACT_APP_TACO_RITUAL_ID as unknown as number; 
const domain = process.env.REACT_APP_TACO_DOMAIN as string;

function App() {
  const [message, setMessage] = useState('this is a secret');
  const [encrypting, setEncrypting] = useState(false);
  const [encryptedText, setEncryptedText] = useState<string | undefined>('');
  const [decrypting, setDecrypting] = useState(false);
  const [decryptedMessage, setDecryptedMessage] = useState<string | undefined>(
    '',
  );

  const { provider  , signer } = useWallet();
  


  const { isInit, encryptDataToBytes, decryptDataFromBytes } = useTaco({
    domain,
    provider,
    ritualId,
  });

  if (!isInit || !provider) {
    return <div>Loading...</div>;
  }

  const encryptMessage = async () => {
    if (!provider) {
      return;
    }
    setEncrypting(true);
    try {
      if (!signer) {
        console.error("Signer غير متوفر، تأكد من البيانات", signer);
        return;
      }
      const signerr = signer;
      console.log(signerr);
      const hasPositiveBalance = new conditions.base.rpc.RpcCondition({
        chain: 80002,
        method: 'eth_getBalance',
        parameters: [':userAddress', 'latest'],
        returnValueTest: {
          comparator: '>=',
          value: 0,
        },
      });

      console.log('Encrypting message...');
      const encryptedBytes = await encryptDataToBytes(
        message,
        hasPositiveBalance,
        signerr,
      );
      if (encryptedBytes) {
        setEncryptedText(toHexString(encryptedBytes));
      }
    } catch (e) {
      console.log(e);
    }
    setEncrypting(false);
  };

  const decryptMessage = async () => {
    if (!encryptedText || !provider) {
      return;
    }
    try {
      setDecrypting(true);
      const signerr = signer;

      if (!signerr) {      
        return;
      }

      console.log('Decrypting message...');
      const decryptedMessage = await decryptDataFromBytes(
        fromHexString(encryptedText),
        signerr,
      );
      if (decryptedMessage) {
        setDecryptedMessage(fromBytes(decryptedMessage));
      }
    } catch (e) {
      console.log(e);
    }
    setDecrypting(false);
  };

  return (
    <div>
      <h2>
        Secret message:{' '}
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onClick={encryptMessage}
        />{' '}
        <button onClick={encryptMessage}>Encrypt</button>{' '}
        {encrypting && 'Encrypting...'}
      </h2>
      <h2>
        Encrypted message:{' '}
        <input
          value={encryptedText}
          onChange={(e) => setEncryptedText(e.target.value)}
        />{' '}
        <button onClick={decryptMessage}>Decrypt</button>{' '}
        {decrypting && 'Decrypting...'}
      </h2>
      {decryptedMessage && <h2>Decrypted message: {decryptedMessage}</h2>}
    </div>
  );
}

export default App;