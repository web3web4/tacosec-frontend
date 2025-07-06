import { useState } from "react";
import { useUser } from "../context/UserContext";
import Swal from "sweetalert2";
import { ContactSupportProps, SupportData } from "../types/types";
import { sendContractSupport } from "../apiService";

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
    if (!supportForm.subject.trim() || !supportForm.message.trim()) {
      Swal.fire("Error", "Please fill in both subject and message fields.", "error");
      return;
    }

    setIsSubmittingSupportRequest(true);
    
    try {
   
      const response = await sendContractSupport(initDataRaw!, {subject: supportForm.subject, message: supportForm.message});

      if (response.ok && response.success) {
        Swal.fire("Success", "Your support request has been sent successfully!", "success");
        setSupportForm({ subject: "", message: ""});
        setShowSupportPopup(false);
      } else {
        throw new Error('Failed to send message to Telegram');
      }
    } catch (error) {
      console.error('Error sending support request:', error);
      Swal.fire("Error", "Failed to send support request. Please try again later.", "error");
    } finally {
      setIsSubmittingSupportRequest(false);
    }
  };

  return { supportForm, setSupportForm, isSubmittingSupportRequest, setIsSubmittingSupportRequest, handleSupportSubmit, handleSupportFormChange };
}
