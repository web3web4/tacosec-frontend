import { ethers } from "ethers";

export interface WalletContextProps {
  address: string | null;
  addressweb: string | null;
  signer: ethers.Signer | null;
  haMetroSwallet: boolean;
  provider: ethers.providers.JsonRpcProvider;
  createWalletFlow: () => void;
  restoreWalletFromEncryptedSeed: (
    encryptedSeed: string,
    password: string
  ) => ethers.Wallet | null;
  setSigner: React.Dispatch<React.SetStateAction<ethers.Signer | null>>;
  setAddress: React.Dispatch<React.SetStateAction<string | null>>;
  setHaMetroSwallet: React.Dispatch<React.SetStateAction<boolean>>;
  decryptedPassword?: string;
  setDecryptedPassword: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
}