import React, { createContext, useContext, ReactNode } from "react";
import {
    Toaster,
    useId,
    useToastController,
    ToastProps,
} from "@fluentui/react-components";
// Izvučemo tip dispatchToast funkcije
type DispatchToastFn = ReturnType<typeof useToastController>["dispatchToast"];

// Prvi parametar: ReactNode; drugi: opcioni objekat opcija
type DispatchToastOptions = Parameters<DispatchToastFn>[1];

interface ToastContextValue {
    dispatchToast: DispatchToastFn;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<React.PropsWithChildren> = ({
                                                                     children,
                                                                 }) => {
    const toasterId = useId();
    const { dispatchToast } = useToastController(toasterId);

    return (
        <>
            <Toaster toasterId={toasterId} placement="bottom-end" style={{ zIndex: 20000 }}/>
            <ToastContext.Provider value={{ dispatchToast }}>
                {children}
            </ToastContext.Provider>
        </>
    );
};

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return ctx;
}
