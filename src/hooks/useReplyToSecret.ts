import { useState } from "react";
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

export default function useReplyToSecret(showReplyPopup: boolean, setShowReplyPopup: React.Dispatch<React.SetStateAction<boolean>>, selectedSecret: SelectedSecretType) {
  const { signer, provider } = useWallet();
  const { initDataRaw, userData } = useUser();
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);
  const [replyForm, setReplyForm] = useState({ title: "", reply: "" });
  const { encryptDataToBytes } = useTaco({
    domain,
    provider,
    ritualId,
  });
  

  const handleReplyFormChange = (field: "title" | "reply", value: string) => {
    setReplyForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleReplySubmit = async () => {
    if (!replyForm.title.trim() || !replyForm.reply.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Title And Reply Input Is Required",
      });
      return;
    }
    if (!provider || !signer) return;

    setIsSubmittingReply(true);
    try {
      await handleReplayToSecret();
      setShowReplyPopup(false);
      setReplyForm({ title: "", reply: "" });
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleReplayToSecret = async () => {
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
      replyForm.reply,
      checkUsersCondition,
      signer!
    );
    if (encryptedBytes) {
      const encryptedHex = toHexString(encryptedBytes);
      const parsedInitData = parseTelegramInitData(initDataRaw!);
      const res = await storageEncryptedData(
        {
          key: replyForm.title,
          description: "",
          type: "text",
          value: encryptedHex!,
          sharedWith: [],
          initData: parsedInitData,
          parent_secret_id: selectedSecret.parentSecretId,
        },
        initDataRaw!
      );
      if (res) {
        Swal.fire({
          icon: "success",
          title: `Answered And The data was successfully encrypted`,
          showConfirmButton: false,
          timer: 4000,
        });
      }
    }
  };

  return {
    showReplyPopup,
    setShowReplyPopup,
    replyForm,
    handleReplyFormChange,
    handleReplySubmit,
    isSubmittingReply
  };
}
