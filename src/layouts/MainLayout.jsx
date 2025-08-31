import {Outlet, useNavigate} from "react-router"
import Header from "../components/ui/Header.js";
import {useAuth} from "@src/Provides/AuthProvider.js";
import {useEffect} from "react";
import Login from "@src/routes/Login.js";
import Spinner from "@src/components/ui/Spinner.js";
// import {setupResponseInterceptor} from "@src/api.js";
export default function MainLayout(){

    const {
        token,
        currentUser,
        handleLogin,
        handleLogout
    } = useAuth();

    if(currentUser === undefined){
        return <Spinner className="h-100"></Spinner>
    }

    if(currentUser === null){
        return <Login></Login>
    }

    return(
    <>
            <div className="flex h-full gap-2">
                <Header handleLogout={handleLogout} className="w-60"/>
                <div className="main bg-gray-50 w-[85%]">
                    <Outlet/>
                </div>
            </div>
    </>
)

}