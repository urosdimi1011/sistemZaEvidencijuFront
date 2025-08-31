import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import axios from '../api';
import {MyInput} from "../components/ui/MyInput";
import {Resolver, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {useAuth} from "../Provides/AuthProvider";
// import Login, { Render } from 'react-login-page';


interface User {
    email: string;
    password: string;
}
export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/'; // Rutu preusmeravanja nakon logina

    const schema = yup.object({
        email: yup.string().trim().min(2,'Morate uneti barem 5 karaktera za email').required('Email je obavezno'),
        password: yup.string().min(2,'Morate uneti barem dva karaktera za password').trim().required('Password je obavezno'),
    }).required();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<User>({
        resolver: yupResolver(schema) as Resolver<User, object, User>
    });

    const {handleLogin } = useAuth();
    const onSubmit = async (data : User)=>{
        setLoading(true);
        setError(null);

        try {
            await handleLogin(data);
            setLoading(false);

        } catch (err: any) {
            setLoading(false);
            setError(err.response?.data?.message || err.message);
        }
    }
    return (
       <div className='flex items-center justify-center login-background !bg-[#0f6cbd] h-screen'>
           <form onSubmit={handleSubmit(onSubmit)} className='login-form bg-gray-50/90 w-1/2 mx-auto p-6 rounded-xl shadow-2xl'>
               <div className='title-header-form'>
                   <h1 className='!text-3xl my-4 font-bold'>Uloguj se</h1>
               </div>
               <MyInput {...register('email')} name='email' type='email' label={'Unesite email'}></MyInput>
               {errors.email && <div className="text-red-900 text-shadow">{errors.email.message}</div>}

               <MyInput {...register('password')} name='password' type='password' label={'Unesite password'}></MyInput>
               {errors.password && <div className="text-red-900 text-shadow">{errors.password.message}</div>}

               <button className='mt-10' type="submit">
                   Uloguj se
               </button>
               <p className='text-red-900 font-bold mt-5'>{error}</p>
           </form>
       </div>
    );
}