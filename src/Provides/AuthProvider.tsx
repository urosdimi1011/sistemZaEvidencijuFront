import {createContext, useContext, useEffect, useLayoutEffect, useState} from "react";
import api from "../api";


const AuthContext = createContext(undefined);

export default function AuthProvider ({children}){

    const [token,setToken] = useState<string| null>();
    const [currentUser, setCurrentUser]= useState();


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

    useEffect(()=>{
        const fetchMe = async ()=>{
            try{
                const response = await api.get('/auth/me', { withCredentials: true });
                setCurrentUser(response.data.user);
                setToken(response.data.tokenAuth);
            }
            catch {
                setToken(null);
                setCurrentUser(null);
            }
        };
        fetchMe();
    },[])

    useEffect(()=>{
        const authInterceptor = api.interceptors.request.use((config)=>{
            console.log(token);
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
            if(error.response.status === 403 && error.response.data.message === 'Unauthorized'){
                try{
                    const response =await api.get('/refreshToken');

                    setToken(response.data.accessToken);

                    originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`
                    originalRequest._retry = true;
                    return api(originalRequest);
                }
                catch {
                    setToken(null)
                }

            }
            return Promise.reject(error);
        })
    })


    return <AuthContext.Provider value={{
        token,
        currentUser,
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