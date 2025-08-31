import axios from 'axios';
import {useEffect, useState} from "react";
import {MyInput} from "../ui/MyInput";
import * as yup from 'yup';
import { useForm, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from "react-hot-toast";
import {Field, Textarea} from "@fluentui/react-components";
import api from "../../api";
interface Paymant {
    iznosZaUplatu: number;
    desc?: string
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


export default function ManagerPaymentsForm({id,idMenadzera,ukupnoMenadzeru,preostaloMenadzeru,onSuccess,managerPayments}) {

    const [loading, setLoading] = useState(false);
    const [hasDescription, setHasDescription] = useState(false);
    const [uplate, setUplate] = useState([]);
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

    const daLiTrebaJosDaSeUplati = ()=>{
        console.log(uplate.reduce((prev,curr)=>Number(prev.amount) + Number(curr.amount),0) ,ukupnoMenadzeru);
        return uplate.reduce((prev,curr)=>Number(prev.amount) + Number(curr.amount),0) > ukupnoMenadzeru;
    }

    const dohvatiMenadzeroveUplate = async ()=>{
        try{
            setLoading(true);
            const response = await api.get(`/menadzeri/isplate/${idMenadzera}`);
            setUplate(response.data);
            setLoading(false);
        }
        catch (xhr){
            setLoading(false);
            if(xhr.status === 404){

            }
            console.log(xhr);
        }

    }

    useEffect(()=>{
        dohvatiMenadzeroveUplate();
    },[])

    const onSubmit = async (data : Paymant)=>{
        setLoading(true);
        setError(null);

        try {
            const response = await api.post<PaymantResponse>(
                `/payments/${id}/isplataMenadzeru`,
                data
            );
            setLoading(false);

            setForm({ iznosZaUplatu : 0 });
            toast.success(response.data.message);
        } catch (err: any) {
            setLoading(false);
            setError(err.response?.data?.message || err.message);
        }
    }

    const dodajOpisZaPlacanje = (e)=>{
        e.preventDefault();
        setHasDescription(!hasDescription);
    }



    const schema = yup.object({
        iznosZaUplatu: yup.number().min(2,'Morate uneti barem 2 cifre'),
        desc : yup.string()
    }).required();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Paymant>({
        resolver: yupResolver(schema) as Resolver<Paymant, object, Paymant>
    });

    const prikaziOpisZaPlacanje = ()=>{
        if(hasDescription){
            return (
                <>
                    <Field  name='desc' label="Unesite napomenu">
                        <Textarea placeholder="Unesite napomenu..." name='desc' {...register('desc')}/>
                    </Field>
                    {errors.desc && <div className="text-red-900 text-shadow">{errors.desc.message}</div>}
                </>
        )
        }
        return '';
    }
    return (
        <>
            <h3 className='my-2'>Menadzeru je ukupno potrebno isplatiti <strong>{ukupnoMenadzeru.toFixed(2)}&euro;</strong>, preostalo: <strong>{preostaloMenadzeru.toFixed(2)}&euro;</strong></h3>
            <form onSubmit={handleSubmit(onSubmit)}>

                <MyInput type='number' {...register('iznosZaUplatu')} label={'Unesite koliko je menadzeru isplaceno?'} name={'iznosZaUplatu'} onChange={handleChange}></MyInput>
                {errors.iznosZaUplatu && <div className="text-red-900 text-shadow">{errors.iznosZaUplatu.message}</div>}
                {prikaziOpisZaPlacanje()}
                <div className='opis'>
                    <button onClick={dodajOpisZaPlacanje} className='!bg-[#0f6cbd] !text-gray-50 !py-1 !px-2 !text-xs my-2'>{hasDescription ? 'Ukloni' : 'Dodaj'} opis</button>
                </div>

                <button className='my-5' type="submit" disabled={loading && daLiTrebaJosDaSeUplati()}>
                    {loading ? 'Sačekajte...' : 'Dodaj iznos za uplatu'}
                </button>
                {error && <div className="error text-red-900 font-bold my-3">{error}</div>}
            </form>
        </>
    );
}