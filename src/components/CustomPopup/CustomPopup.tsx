import { CustomPopupProps } from "@/types";
import { closeIcon } from "@/assets";
import { useEffect } from "react";
import "./CustomPopup.css";

export default function CustomPopup({
  children,
  open,
  closed,
}: CustomPopupProps) {
  useEffect(() => {
    const preventScroll = (e: Event) => {
      // Only prevent scroll if the event target is not within the popup container
      const target = e.target as Element;
      const popupContainer = document.querySelector('.popup-container');
      
      if (popupContainer && !popupContainer.contains(target)) {
        e.preventDefault();
      }
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
