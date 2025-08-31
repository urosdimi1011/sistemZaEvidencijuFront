import axios from 'axios';
import {useState} from "react";
import {MyInput} from "../ui/MyInput";
import * as yup from 'yup';
import { useForm, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from "react-hot-toast";
import api from "../../api";
interface Paymant {
    iznosZaUplatu: number;
}

interface PaymantResponse {
    message: string;
    payment: {
        id: number,
        amount: number,
        paidAt: string
    },
    student: {
        totalPaid: number,
        remainingAmount: number
    }
}

export default function PaymantForm({id,onSuccess}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<Paymant>({
        iznosZaUplatu: 0
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({...prev,[name]:value}));
    };


    const onSubmit = async (data : Paymant)=>{
        setLoading(true);
        setError(null);

        try {
            const response = await api.post<PaymantResponse>(
                `/payments/${id}`,
                data
            );
            setLoading(false);

            setForm({ iznosZaUplatu : 0 });
            onSuccess(true);
            toast.success(response.data.message);
        } catch (err: any) {
            setLoading(false);
            setError(err.response?.data?.message || err.message);
        }
    }
    const schema = yup.object({
        iznosZaUplatu: yup.number().min(2,'Morate uneti barem 2 cifre'),
    }).required();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Paymant>({
        resolver: yupResolver(schema) as Resolver<Paymant, object, Paymant>
    });
    return (
        <form onSubmit={handleSubmit(onSubmit)}>

            <MyInput type='number' {...register('iznosZaUplatu')} label={'Unesite koliko je učenik uplatio?'} name={'iznosZaUplatu'} onChange={handleChange}></MyInput>
            {errors.iznosZaUplatu && <div className="text-red-900 text-shadow">{errors.iznosZaUplatu.message}</div>}

            <button className='my-5' type="submit" disabled={loading}>
                {loading ? 'Sačekajte...' : 'Dodaj iznos za uplatu'}
            </button>
            {error && <div className="error text-red-900 font-bold my-3">{error}</div>}

        </form>
    );
}