import React, { createContext, useContext, useState, useCallback } from "react";
import Snackbar from "@/components/Snackbar/Snackbar";

interface SnackbarContextType {
    showSnackbar: (message: string) => void;
}

const visibilityTime = 3000;
const SnackbarContext = createContext<SnackbarContextType | null>(null);

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [message, setMessage] = useState("");
    const [isVisible, setIsVisible] = useState(false);

    const showSnackbar = useCallback((msg: string) => {
        setMessage(msg);
        setIsVisible(true);
        setTimeout(() => {
            setIsVisible(false);
        }, visibilityTime);
    }, []);

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            <Snackbar message={message} isVisible={isVisible} />
        </SnackbarContext.Provider>
    );
};

export const useSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error("useSnackbar must be used within a SnackbarProvider");
    }
    return context;
};
