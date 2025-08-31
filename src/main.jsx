import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router";
import MainLayout from "./layouts/MainLayout.jsx";
import Managers from "@src/routes/Managers.js";
import './App.css';
import {FluentProvider, webLightTheme} from '@fluentui/react-components';
import Students from "@src/routes/Students.js";
import TestToaster from "@src/routes/TestToast.js";
// import {ToastProvider} from "@src/components/ui/ToastContext.js";
import { Toaster } from 'react-hot-toast';
import Login from "@src/routes/Login.js";
import AuthProvider from "@src/Provides/AuthProvider.js";
import ReverseProtectedRoute from "@src/components/route/ReverseProtectedRoute.js";
import Home from "@src/routes/Home.js";
import ExpectedPayments from "@src/routes/ExpectedPayments.js";
const router = createBrowserRouter([
    {
        path:"/",
        element : <MainLayout/>,
        children: [
            {
                path:"",
                element:<Home/>
            }
        ]
    },
    {
        path:"/ocekivane-uplate",
        element : <MainLayout/>,
        children: [
            {
                path:"",
                element:<ExpectedPayments/>
            }
        ]
    },
    {
        path:"/menadzeri",
        element : <MainLayout/>,
        children: [
            {
                path:"",
                element:<Managers/>
            }
        ]
    },
    {
        path:"/ucenici",
        element : <MainLayout/>,
        children: [
            {
                path:"",
                element:<Students/>
            }
        ]
    },
    {
        path:"/login",
        element : <ReverseProtectedRoute><Login/></ReverseProtectedRoute>,
    }
])


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <FluentProvider theme={webLightTheme}>
                <Toaster/>
                <RouterProvider router={router} />
            </FluentProvider>
        </AuthProvider>
    </StrictMode>
)
