import {createContext, useContext, useEffect, useLayoutEffect, useState} from "react";
import api from "../api";


const AuthContext = createContext(undefined);
interface User {
    id: number;
    email: string;
    role: 'admin' | 'school_manager' | 'korisnik';
    schoolId: number | null;
    school?: {
        id: number;
        name: string;
    };
}
export default function AuthProvider ({children}){

    const [token,setToken] = useState<string| null>();
    const [currentUser, setCurrentUser]= useState<User>();
    const [authLoading, setAuthLoading] = useState(true); // 👈 Dodajte loading state


    async function handleLogin(data){
        try{
            //Ovo je komunikacija sa backednom
            const response = await api.post('/auth/login',data,{
                withCredentials: true
            });
            const {tokenAuth,user} = response.data;
            setToken(tokenAuth);
            setCurrentUser(user);
        }
        catch(xhr){
            setToken(null);
            setCurrentUser(null);
            throw xhr;
        }
    }
    async function handleLogout(){
        await api.post('/auth/logout', {}, { withCredentials: true });
        setToken(null);
        setCurrentUser(null);
    }

    function canAccessResource(resourceSchoolId?: number): boolean {
        if (!currentUser) return false;

        if (currentUser.role === 'admin') return true;

        if (!resourceSchoolId) {
            return currentUser.schoolId !== null;
        }

        return currentUser.schoolId === resourceSchoolId;
    }

    function hasPermission(permission: string): boolean {
        if (!currentUser) return false;

        switch (permission) {
            case 'manage_students':
                return currentUser.role === 'admin' || currentUser.role === 'school_manager';

            case 'manage_managers':
                return currentUser.role === 'admin';

            case 'view_manager_data':
                return currentUser.role === 'admin';

            case 'manage_payments':
                return currentUser.role === 'admin' || currentUser.role === 'school_manager';

            case 'view_all_schools':
                return currentUser.role === 'admin';

            case 'manage_occupations':
                return currentUser.role === 'admin';

            default:
                return false;
        }
    }

    useEffect(()=>{
        const fetchMe = async ()=>{
            setAuthLoading(true);
            try{
                const response = await api.get('/auth/me', { withCredentials: true });
                setCurrentUser(response.data.user);
                setToken(response.data.tokenAuth);
            }
            catch {
                setToken(null);
                setCurrentUser(null);
            }
            finally {
                setAuthLoading(false); // 👈 Postavite loading na false
            }
        };
        fetchMe();
    },[])

    useEffect(()=>{
        const authInterceptor = api.interceptors.request.use((config)=>{
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        })

        return ()=>{
            api.interceptors.request.eject(authInterceptor);
        }
    },[token]);


    useLayoutEffect(()=>{
        const refreshToken = api.interceptors.response.use((response)=>response,async (error)=>{
                const originalRequest = error.config;
                const currentPath = window.location.pathname;

                if(error.response?.status === 403 && error.response.data.message === 'Unauthorized'){
                    try{
                        const response = await api.get('/refreshToken');
                        setToken(response.data.accessToken);
                        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                        originalRequest._retry = true;
                        return api(originalRequest);
                    }
                    catch {
                        setToken(null);
                        setCurrentUser(null);
                        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
                            window.location.href = '/login'
                        }
                    }
                }
                if(error.response?.status === 401) {
                    // Proveri da li je korisnik bio ulogovan (ima token u state ili je pokušavao da se uloguje)
                    if (token || currentUser) {
                        setToken(null);
                        setCurrentUser(null);

                        // Preuseri samo ako nije na login/register stranici
                        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
                            window.location.href = '/login'
                            // Opciono: toast notifikacija
                            // toast.error('Sesija je istekla. Molimo prijavite se ponovo.');
                        }
                    }
                }


                // window.location.href='/login';
                // return () => {
                //     api.interceptors.response.eject(refreshToken);
                // };
            return Promise.reject(error);
            })

    })


    return <AuthContext.Provider value={{
        token,
        currentUser,
        authLoading,
        hasPermission,
        canAccessResource,
        handleLogin,
        handleLogout
    }}>
        {children}
    </AuthContext.Provider>


}
export const useAuth = ()=>{
    //Ovo je custom hooks
    const authContext = useContext(AuthContext);

    if(!authContext){
        throw new Error("useAuyth must be used within a AuthProvide");
    }
    return authContext;
}