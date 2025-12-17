import { useState } from 'react';
import { MetroSwal } from '@/utils';
import { SecretViews } from '@/types/types';

export default function useSecretViews() {
  const [secretViews, setSecretViews] = useState<Record<string, SecretViews>>({});
  const [showViewersPopup, setShowViewersPopup] = useState<boolean>(false);
  const [currentSecretViews, setCurrentSecretViews] = useState<SecretViews | null>(null);

  const handleGetSecretViews = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, secretId: string) => {
    e.stopPropagation();
    const data = handleCheckSecretViewsData(e, secretId);
    if (data) {
      setCurrentSecretViews(data);
      setShowViewersPopup(true);
    }
  };

  const handleCheckSecretViewsData = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: string): SecretViews | null => {
    e.stopPropagation();
    const data = secretViews[id];

    if (!data || data.viewDetails.length === 0) {
      MetroSwal.fire({
        icon: 'info',
        title: 'No Views',
        text: 'No one has viewed this message yet.',
        confirmButtonColor: 'var(--primary-color)'
      });
      return null;
    }

    return data;
  };

  return {
    secretViews,
    setSecretViews,
    showViewersPopup,
    setShowViewersPopup,
    currentSecretViews,
    setCurrentSecretViews,
    handleGetSecretViews,
  };
}
