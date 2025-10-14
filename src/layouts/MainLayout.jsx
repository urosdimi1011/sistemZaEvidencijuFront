import { useAuth } from "@src/Provides/AuthProvider.js";
import { Spinner } from "@fluentui/react-components";
import Login from "@src/routes/Login.js";
import {Outlet } from "react-router";
import { ProgressBar } from "@src/components/ui/ProgressBar";
import { useEffect,useRef  } from "react";
import Header from "@src/components/ui/Header.js";
import {useApiProgress} from "@src/utils/useApiProgress.js";

export default function MainLayout() {
    const {
        token,
        currentUser,
        authLoading,
        handleLogin,
        handleLogout
    } = useAuth();

    const {
        apiProgress,
        isApiLoading,
        startApiProgress,
        completeApiProgress
    } = useApiProgress();
    const prevAuthLoadingRef = useRef();



    useEffect(() => {
        if (prevAuthLoadingRef.current !== authLoading) {
            if (authLoading) {
                startApiProgress();
            } else {
                completeApiProgress();
            }
            prevAuthLoadingRef.current = authLoading;
        }
    }, [authLoading, startApiProgress, completeApiProgress]);

    useEffect(() => {
        return () => {
            if (authLoading) {
                completeApiProgress();
            }
        };
    }, []);

    if (authLoading ) {
        return (
            <div className="h-screen flex items-center justify-center">
                <ProgressBar progress={apiProgress} isLoading={isApiLoading} />
                <Spinner size="large" label="Provera autentifikacije..." />
            </div>
        );
    }

    if (currentUser === null) {
        return <Login></Login>;
    }

    return (
        <>
            <div className={`flex h-full gap-2 ${isApiLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}>
                <Header handleLogout={handleLogout} className="w-60"/>
                <div className="main bg-gray-50 w-full">
                    <Outlet/>
                </div>
            </div>
        </>
    );
}