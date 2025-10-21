import { DropdownMenuProps, DropdownOption } from '@/types';
import { useState, useRef, useEffect } from 'react';
import './DropdownMenu.css';

export default function DropdownMenu({ options, className = '' }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: DropdownOption) => {
    option.onClick();
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`dropdown-menu-container ${className}`} ref={dropdownRef}>
      <button 
        className="dropdown-trigger"
        onClick={toggleDropdown}
        aria-label="More options"
      >
        ...
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option, index) => (
            <div key={index}>
              <button
                className="dropdown-option"
                onClick={() => handleOptionClick(option)}
              >
                {option.icon && <span className="option-icon">{option.icon}</span>}
                <span className="option-label">{option.label}</span>
              </button>
              {index < options.length - 1 && <div className="dropdown-divider" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}