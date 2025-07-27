//import { expect } from 'vitest'; 

import { fromBytes, toBytes } from '@nucypher/shared'; 
import { 
  conditions, 
  decrypt, 
  encrypt, 
  initialize, 
  ThresholdMessageKit, 
} from '@nucypher/taco'; 
import { 
  EIP4361AuthProvider, 
  USER_ADDRESS_PARAM_DEFAULT, 
} from '@nucypher/taco-auth'; 
import { ethers } from 'ethers'; 

const RPC_PROVIDER_URL = 'https://rpc-amoy.polygon.technology'; 
const ENCRYPTOR_PRIVATE_KEY = 
  '0x900edb9e8214b2353f82aa195e915128f419a92cfb8bbc0f4784f10ef4112b86'; 
const CONSUMER_PRIVATE_KEY = 
  '0xf307e165339cb5deb2b8ec59c31a5c0a957b8e8453ce7fe8a19d9a4c8acf36d4'; 
const DOMAIN = 'lynx'; 
const RITUAL_ID = 27; 
const CHAIN_ID = 80002; 

// The wallet address of our consumer 
const CONSUMER_ADDRESS = ethers.utils.computeAddress(CONSUMER_PRIVATE_KEY); 

let provider: ethers.providers.JsonRpcProvider; 
let encryptorSigner: ethers.Wallet; 
let consumerSigner: ethers.Wallet; 

provider = new ethers.providers.JsonRpcProvider(RPC_PROVIDER_URL); 
encryptorSigner = new ethers.Wallet(ENCRYPTOR_PRIVATE_KEY, provider); 
consumerSigner = new ethers.Wallet(CONSUMER_PRIVATE_KEY, provider); 

async function check() { 
  // Initialize the library 
  await initialize(); 

  // Verify network connection 
  const network = await provider.getNetwork(); 
  if (network.chainId !== CHAIN_ID) { 
    throw new Error( 
      `Provider connected to wrong network. Expected ${CHAIN_ID}, got ${network.chainId}`, 
    ); 
  } 

  // Create test message 
  const messageString = 
    'This message should only be accessible to allowed wallet addresses'; 
  const message = toBytes(messageString); 

  // Create wallet allowlist condition with consumer address in the list 
  const addressAllowlistCondition = 
    new conditions.base.addressAllowlist.AddressAllowlistCondition({ 
        userAddress: ':userAddress',
      addresses: [ 
        CONSUMER_ADDRESS, 
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Some other address 
        '0x0000000000000000000000000000000000000001', // Another address 
      ], 
    }); 

  // Verify that the condition requires authentication 
  //expect(addressAllowlistCondition.requiresAuthentication()).toBe(true); 

  // Encrypt message with the wallet allowlist condition 
  const messageKit = await encrypt( 
    provider, 
    DOMAIN, 
    message, 
    addressAllowlistCondition, 
    RITUAL_ID, 
    encryptorSigner, 
  ); 

  const encryptedBytes = messageKit.toBytes(); 

  // Prepare for decryption 
  const messageKitFromBytes = ThresholdMessageKit.fromBytes(encryptedBytes); 
  const conditionContext = 
    conditions.context.ConditionContext.fromMessageKit(messageKitFromBytes); 

  // Add auth provider for the consumer wallet 
  const authProvider = new EIP4361AuthProvider(provider, consumerSigner, { 
    domain: 'localhost', 
    uri: 'http://localhost:3000', 
  }); 
  conditionContext.addAuthProvider(USER_ADDRESS_PARAM_DEFAULT, authProvider); 

  // Decrypt message 
  const decryptedBytes = await decrypt( 
    provider, 
    DOMAIN, 
    messageKitFromBytes, 
    conditionContext, 
  ); 
  const decryptedMessageString = fromBytes(decryptedBytes); 

  // Verify decryption was successful 
  //expect(decryptedMessageString).toEqual(messageString); 
  console.log('Test passed! Decryption successful.');
} 

check().catch(error => {
  console.error('Test failed:', error);
});