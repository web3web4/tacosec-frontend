import closeIcon from "../../assets/icons/close-icon.png";
import { ReactNode } from "react";
import "./CustomPopup.css";

interface CustomPopupProps {
  children: ReactNode;
  open: boolean;
  closed: (value: boolean) => void;
}

export default function CustomPopup({
  children,
  open,
  closed,
}: CustomPopupProps) {
  return open ? (
    <div className="popup">
      <div className="popup-container">
          <div className="close-btn" onClick={() => closed(false)}>
            <img src={closeIcon} alt="x" width={20}/>
          </div>
          {children}
      </div>
    </div>
  ) : (
    <></>
  );
}
