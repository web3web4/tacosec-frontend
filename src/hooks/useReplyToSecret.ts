import { conditions, toHexString } from "@nucypher/taco";
import { storageEncryptedData } from "@/apiService";
import { useWallet } from "@/wallet/walletContext";
import { SelectedSecretType } from "@/types/types";
import { parseTelegramInitData, createAppError, handleSilentError } from "@/utils";
import { useUser, useHome } from "@/context";
import useTaco from "@/hooks/useTaco";
import MetroSwal from "sweetalert2";
import { v4 as uuidv4 } from 'uuid';

const ritualId = process.env.REACT_APP_TACO_RITUAL_ID as unknown as number;
const domain = process.env.REACT_APP_TACO_DOMAIN as string;
const BACKEND = process.env.REACT_APP_API_BASE_URL as string;

export default function useReplyToSecret() {
  const { triggerGetChildrenForSecret } = useHome();
  const { signer, provider } = useWallet();
  const { initDataRaw, userData } = useUser();
  const { encryptDataToBytes } = useTaco({
    domain,
    provider,
    ritualId,
  });

  const handleReplyToSecret = async (selectedSecret: SelectedSecretType) => {
    const result = await MetroSwal.fire({
      title: 'Reply to Secret',
      html: `
        <div style="text-align: left; margin-bottom: 16px;">
          <div>
            <label style="display: block; font-weight: 500; color: #555; font-size: 14px; margin-bottom: 6px;">Reply</label>
            <textarea id="reply-message" placeholder="Enter your reply..." rows="5" style="
              width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px;
              font-size: 14px; font-family: inherit; resize: vertical; min-height: 100px;
              box-sizing: border-box; background: #f8f9fa; outline: none;
            " onfocus="this.style.borderColor='var(--primary-color)'" onblur="this.style.borderColor='#ddd'"></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      confirmButtonColor: 'var(--primary-color)',
      width: '500px',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const reply = (document.getElementById('reply-message') as HTMLTextAreaElement)?.value;
        
        if (!reply || !reply.trim()) {
          MetroSwal.showValidationMessage('Reply is required!');
          return false;
        }
        
        if (!provider || !signer) {
          MetroSwal.showValidationMessage('Wallet not connected!');
          return false;
        }

        try {
          await handleReplayToSecret(reply.trim(), selectedSecret);
          return { title: "", reply: reply.trim() };
        } catch (error) {
          handleSilentError(error, 'submitting reply');
          MetroSwal.showValidationMessage('Failed to submit reply. Please try again.');
          return false;
        }
      },
      allowOutsideClick: () => !MetroSwal.isLoading()
    });

    if (result.isConfirmed) {
      MetroSwal.fire({
        icon: "success",
        title: `Reply submitted successfully!`,
        text: "Your reply has been encrypted and stored.",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  const handleReplayToSecret = async (reply: string, selectedSecret: SelectedSecretType) => {
    let usernames: string = selectedSecret.parentUsername ?? userData?.username!;
    selectedSecret.shareWith.map((user) => usernames += "," +  user.username);

    const checkUsersCondition = new conditions.base.jsonApi.JsonApiCondition({
      endpoint: `${BACKEND}/telegram/verify-test`,
      parameters: {
        TelegramUsernames: usernames,
        authorizationToken: ":authorizationToken",
      },
      query: "$.isValid",
      returnValueTest: { comparator: "==", value: true },
    });

    const encryptedBytes = await encryptDataToBytes(
      reply,
      checkUsersCondition,
      signer!
    );
    if (encryptedBytes) {
      const encryptedHex = toHexString(encryptedBytes);
      const parsedInitData = parseTelegramInitData(initDataRaw!);
      const res = await storageEncryptedData(
        {
          key: `reply: ${uuidv4()}`,
          description: "",
          type: "text",
          value: encryptedHex!,
          sharedWith: selectedSecret.shareWith,
          initData: parsedInitData,
          parent_secret_id: selectedSecret.parentSecretId,
        },
        initDataRaw!
      );
      triggerGetChildrenForSecret(selectedSecret.parentSecretId);
      if (!res) {
        throw new Error("Failed to store encrypted data");
      }
    } else {
      throw new Error("Failed to encrypt data");
    }
  };

  return {
    handleReplyToSecret
  };
}
