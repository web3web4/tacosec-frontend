import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import "./SheetModal.css";

interface SheetModalProps {
    open: boolean;
    onClose: (value: boolean) => void;
    title: string;
    children: React.ReactNode;
}

export default function SheetModal({
    open,
    onClose,
    title,
    children,
}: SheetModalProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    // Scroll locking effect
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    // Handle rendering state
    useEffect(() => {
        if (open) {
            setShouldRender(true);
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [open]);

    // Handle animation trigger
    useEffect(() => {
        if (open && shouldRender) {
            // Use a small timeout to ensure the DOM has been updated and painted
            const timer = setTimeout(() => {
                setIsAnimating(true);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [open, shouldRender]);

    const handleClose = () => {
        // Start the close animation
        setIsAnimating(false);
        // Wait for animation to complete before calling onClose
        setTimeout(() => {
            onClose(false);
        }, 300); // Match animation duration
    };

    if (!shouldRender) return null;

    return (
        <div className={`sheet-modal ${isAnimating ? "active" : ""}`}>
            <div className="sheet-header">
                <button className="back-button" onClick={handleClose} aria-label="Go back">
                    <FaArrowLeft color="var(--metro-green)" />
                </button>
                <h2 className="sheet-title">{title}</h2>
            </div>
            <div className="sheet-content">{children}</div>
        </div>
    );
}
