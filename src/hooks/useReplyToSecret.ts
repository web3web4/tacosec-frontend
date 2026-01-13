import { conditions, toHexString } from "@nucypher/taco";
import { storageEncryptedData } from "@/services";
import { useWallet } from "@/wallet/walletContext";
import { SelectedSecretType } from "@/types/types";
import { handleSilentError , config, sanitizePlainText } from "@/utils";
import { useUser, useHome } from "@/context";
import useTaco from "@/hooks/useTaco";
import { MetroSwal } from "@/utils";
import { v4 as uuidv4 } from 'uuid';
import { SetStateAction, useState } from "react";

const ritualId = config.TACO_RITUAL_ID;
const domain = config.TACO_DOMAIN;

interface ReplyPopupProps{
    setShowReplyPopup: React.Dispatch<SetStateAction<boolean>>,
    selectedSecret: SelectedSecretType
}

export default function useReplyToSecret({setShowReplyPopup, selectedSecret}: ReplyPopupProps) {
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);
  const [replyMessage, setReplyMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { triggerGetChildrenForSecret } = useHome();
  const { signer, provider, address } = useWallet();
  const { initDataRaw } = useUser();
  const { encryptDataToBytes } = useTaco({
    domain,
    provider,
    ritualId,
  });

 const handleReplyMessageChange = (value: string) => {
    setReplyMessage(value);
  };

  const handleReplayToSecret = async () => {
    setErrorMessage("");

    // Sanitize reply before validation and encryption
    const safeReply = sanitizePlainText(replyMessage, { maxLength: 5000, preserveNewlines: true });

    if (!safeReply || !safeReply.trim()) {
      setErrorMessage('Reply is required!');
      return false;
    }
    
    if (!provider || !signer) {
      setErrorMessage('Wallet not connected!');
      return false;
    }
    try {
      setIsSubmittingReply(true)
      let publicAddress: string[] = [];
      publicAddress.push(selectedSecret.parentAddress ?? address!);
      selectedSecret.shareWith.map((user) => publicAddress.push(user.publicAddress));
      
        const checkUsersCondition =
          new conditions.base.contextVariable.ContextVariableCondition({
            contextVariable: ":userAddress",
            returnValueTest: {
              comparator: "in",
              value: publicAddress,
            },
          });

      const encryptedBytes = await encryptDataToBytes(
        safeReply,
        checkUsersCondition,
        signer!
      );
      if (encryptedBytes) {
        const encryptedHex = toHexString(encryptedBytes);
        const cleanedSharedWith = selectedSecret.shareWith.map(({ shouldSendTelegramNotification, ...rest }) => rest);
        const res = await storageEncryptedData(
          {
            key: `reply: ${uuidv4()}`,
            description: "",
            type: "text",
            value: encryptedHex!,
            sharedWith: cleanedSharedWith,
            parent_secret_id: selectedSecret.parentSecretId,
          },
          initDataRaw!
        );
        triggerGetChildrenForSecret(selectedSecret.parentSecretId);
        setShowReplyPopup(false);
        MetroSwal.fire({
        icon: "success",
        title: `Reply submitted successfully!`,
        text: "Your reply has been encrypted and stored.",
        showConfirmButton: false,
        timer: 3000,
      });
        if (!res) {
          throw new Error("Failed to store encrypted data");
        }
      } else {
        throw new Error("Failed to encrypt data");
      }
    } catch (error) {
      handleSilentError(error, 'submitting reply');
      MetroSwal.warning('Failed to submit reply. Please try again.');
      return false;
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return {
    replyMessage,
    errorMessage,
    isSubmittingReply,
    handleReplyMessageChange,
    handleReplayToSecret
  };
}
