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
import { Toaster } from 'react-hot-toast';
import Login from "@src/routes/Login.js";
import AuthProvider from "@src/Provides/AuthProvider.js";
import ReverseProtectedRoute from "@src/components/route/ReverseProtectedRoute.js";
import Home from "@src/routes/Home.js";
import ExpectedPayments from "@src/routes/ExpectedPayments.js";

import { registerSW } from 'virtual:pwa-register'
import ProtectedRoute from "./routes/ProtectedRoute.js";
import Users from "./routes/Users.js";

const updateSW = registerSW({
    onNeedRefresh() {
        console.log("New content available, refresh needed.")
    },
    onOfflineReady() {
        console.log("App ready to work offline")
    },
})

const router = createBrowserRouter([
    {
        path:"/",
        element :
                <ProtectedRoute
                    requiredPermission="manage_managers"
                >
                    <MainLayout/>
                </ProtectedRoute>,
        children: [
            {
                path:"",
                element:<Home/>
            }
        ]
    },
    {
        path:"/ocekivane-uplate",
        element :
            <ProtectedRoute
                requiredPermission="manage_managers"
            >
                <MainLayout/>
            </ProtectedRoute>,
        children: [
            {
                path:"",
                element:<ExpectedPayments/>
            }
        ]
    },
    {
        path:"/korisnici",
        element :
            <ProtectedRoute
                requiredPermission="manage_managers"
            >
                <MainLayout/>
            </ProtectedRoute>,
        children: [
            {
                path:"",
                element:<Users/>
            }
        ]
    },
    {
        path:"/menadzeri",
        element :
            <ProtectedRoute
                requiredPermission="manage_managers"
            >
                <MainLayout/>
            </ProtectedRoute>,
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
        element :
            <ReverseProtectedRoute>
                <Login/>
            </ReverseProtectedRoute>,
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
