import closeIcon from "../../assets/icons/close-icon.png";
import { ReactNode, useEffect } from "react";
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
  useEffect(() => {
    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    if (open) {
      document.body.style.overflow = "hidden";

      window.addEventListener("wheel", preventScroll, { passive: false });
      window.addEventListener("touchmove", preventScroll, { passive: false });
    } else {
      document.body.style.overflow = "";

      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
    };
  }, [open]);

  return open ? (
    <div className="popup">
      <div className="popup-container">
        <div className="close-btn" onClick={() => closed(false)}>
          <img src={closeIcon} alt="x" width={20} />
        </div>
        {children}
      </div>
    </div>
  ) : null;
}
