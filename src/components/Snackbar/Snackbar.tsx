import React from "react";
import "./Snackbar.css";

interface SnackbarProps {
    message: string;
    isVisible: boolean;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, isVisible }) => {
    return (
        <div className={`snackbar ${isVisible ? "show" : ""}`}>
            {message}
        </div>
    );
};

export default Snackbar;
