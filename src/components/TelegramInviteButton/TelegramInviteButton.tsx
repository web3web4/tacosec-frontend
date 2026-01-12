import { TelegramInviteButtonProps } from '@/types';

const TelegramInviteButton: React.FC<TelegramInviteButtonProps> = ({
  username,
  botUserName,
  onClick,
  className = '',
  children
}) => {
  const inviteMessage = `🔐 I'd like to share something with you securely. Open ${botUserName} to get started ✨`;
  
  return (
    <a
      href={`https://t.me/${username}?text=${encodeURIComponent(inviteMessage)}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <button className={className} onClick={onClick}>
        {children}
      </button>
    </a>
  );
};

export default TelegramInviteButton;