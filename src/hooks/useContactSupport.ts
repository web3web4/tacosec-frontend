import { ContactSupportProps, SupportData } from "@/types/types";
import { sendContractSupport } from "@/services";
import MetroSwal from "sweetalert2";
import { useUser } from "@/context";
import { useState } from "react";
import { showError, createAppError, sanitizeTitle, sanitizePlainText } from "@/utils";

export default function UseContactSupport({ setShowSupportPopup }: ContactSupportProps) {
  const { initDataRaw } = useUser();
  const [supportForm, setSupportForm] = useState<SupportData>({subject: "", message: ""});
  const [isSubmittingSupportRequest, setIsSubmittingSupportRequest] = useState(false);

  const handleSupportFormChange = (field: string, value: string) => {
    setSupportForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSupportSubmit = async () => {
    // Sanitize inputs before validation and sending
    const safeSubject = sanitizeTitle(supportForm.subject);
    const safeMessage = sanitizePlainText(supportForm.message, { maxLength: 5000, preserveNewlines: true });

    if (!safeSubject.trim() || !safeMessage.trim()) {
      MetroSwal.fire("Error", "Please fill in both subject and message fields.", "error");
      return;
    }

    setIsSubmittingSupportRequest(true);
    try {
      const response = await sendContractSupport(initDataRaw!, {subject: safeSubject, message: safeMessage});

      if (response.success) {
          MetroSwal.fire("Success", "Your support request has been sent successfully!", "success");
          setSupportForm({ subject: "", message: ""});
          setShowSupportPopup(false);
      } else {
          throw new Error('Failed to send message to Telegram');
      }
    } catch (error) {
      console.error('Error sending support request:', error);
      const appError = createAppError(error, 'unknown');
      showError(appError, 'Support Request Error');
    } finally {
      setIsSubmittingSupportRequest(false);
    }
  };

  return { supportForm, setSupportForm, isSubmittingSupportRequest, setIsSubmittingSupportRequest, handleSupportSubmit, handleSupportFormChange };
}
