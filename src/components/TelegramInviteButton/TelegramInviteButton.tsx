import React from 'react';

interface TelegramInviteButtonProps {
  username: string;
  botUserName: string;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

const TelegramInviteButton: React.FC<TelegramInviteButtonProps> = ({
  username,
  botUserName,
  onClick,
  className = '',
  children
}) => {
  const inviteMessage = `I've shared some private files with you. Please open the bot to view them: ${botUserName}`;
  
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