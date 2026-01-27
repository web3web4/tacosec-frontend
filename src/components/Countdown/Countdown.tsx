import { useEffect, useState } from 'react';
import './Countdown.css';

interface CountdownProps {
  unlockTime: string;
  onUnlock?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isUnlocked: boolean;
}

export default function Countdown({ unlockTime, onUnlock }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isUnlocked: false,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const unlockDate = new Date(unlockTime).getTime();
      const difference = unlockDate - now;

      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isUnlocked: true,
        });
        if (onUnlock) {
          onUnlock();
        }
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isUnlocked: false,
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [unlockTime, onUnlock]);

  if (timeRemaining.isUnlocked) {
    return (
      <div className="countdown-unlocked">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 21V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M4.22 4.22L5.64 5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M18.36 18.36L19.78 19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M1 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M21 12H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M4.22 19.78L5.64 18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <span>Unlocked</span>
      </div>
    );
  }

  return (
    <div className="countdown-container">
      <svg className="countdown-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <div className="countdown-time">
        {timeRemaining.days > 0 && (
          <span className="time-unit">
            <strong>{timeRemaining.days}</strong>d
          </span>
        )}
        {(timeRemaining.days > 0 || timeRemaining.hours > 0) && (
          <span className="time-unit">
            <strong>{String(timeRemaining.hours).padStart(2, '0')}</strong>h
          </span>
        )}
        <span className="time-unit">
          <strong>{String(timeRemaining.minutes).padStart(2, '0')}</strong>m
        </span>
        <span className="time-unit">
          <strong>{String(timeRemaining.seconds).padStart(2, '0')}</strong>s
        </span>
      </div>
    </div>
  );
}
