import { useWallet } from "../wallet/walletContext";
import useTaco from "./useTaco";
import { conditions } from "@nucypher/taco";
import { toHexString } from "@nucypher/shared";
import { parseTelegramInitData } from "../utils/tools";
import { storageEncryptedData } from "../apiService";
import { useUser } from "../context/UserContext";
import Swal from "sweetalert2";
import { SelectedSecretType } from "../types/types";

const ritualId = process.env.REACT_APP_TACO_RITUAL_ID as unknown as number;
const domain = process.env.REACT_APP_TACO_DOMAIN as string;
const BACKEND = process.env.REACT_APP_API_BASE_URL as string;

export default function useReplyToSecret() {
  const { signer, provider } = useWallet();
  const { initDataRaw, userData } = useUser();
  const { encryptDataToBytes } = useTaco({
    domain,
    provider,
    ritualId,
  });

  const handleReplyToSecret = async (selectedSecret: SelectedSecretType) => {
    const result = await Swal.fire({
      title: 'Reply to Secret',
      html: `
        <div style="text-align: left; margin-bottom: 16px;">
          <div style="margin-bottom: 12px;">
            <label style="display: block; font-weight: 500; color: #555; font-size: 14px; margin-bottom: 6px;">Title</label>
            <input id="reply-title" type="text" placeholder="Enter reply title" maxlength="100" style="
              width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px;
              font-size: 14px; font-family: inherit; box-sizing: border-box;
              background: #f8f9fa; outline: none;
            " onfocus="this.style.borderColor='var(--primary-color)'" onblur="this.style.borderColor='#ddd'" />
          </div>
          <div>
            <label style="display: block; font-weight: 500; color: #555; font-size: 14px; margin-bottom: 6px;">Reply</label>
            <textarea id="reply-message" placeholder="Enter your reply..." rows="5" maxlength="1000" style="
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
        const title = (document.getElementById('reply-title') as HTMLInputElement)?.value;
        const reply = (document.getElementById('reply-message') as HTMLTextAreaElement)?.value;
        
        if (!title || !title.trim()) {
          Swal.showValidationMessage('Title is required!');
          return false;
        }
        
        if (!reply || !reply.trim()) {
          Swal.showValidationMessage('Reply is required!');
          return false;
        }
        
        if (!provider || !signer) {
          Swal.showValidationMessage('Wallet not connected!');
          return false;
        }

        try {
          await handleReplayToSecret(title.trim(), reply.trim(), selectedSecret);
          return { title: title.trim(), reply: reply.trim() };
        } catch (error) {
          console.error("Error submitting reply:", error);
          Swal.showValidationMessage('Failed to submit reply. Please try again.');
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (result.isConfirmed) {
      Swal.fire({
        icon: "success",
        title: `Reply submitted successfully!`,
        text: "Your reply has been encrypted and stored.",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  const handleReplayToSecret = async (title: string, reply: string, selectedSecret: SelectedSecretType) => {
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
          key: title,
          description: "",
          type: "text",
          value: encryptedHex!,
          sharedWith: [],
          initData: parsedInitData,
          parent_secret_id: selectedSecret.parentSecretId,
        },
        initDataRaw!
      );
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
