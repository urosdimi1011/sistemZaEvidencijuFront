import axios from 'axios';
import {useCallback, useEffect, useState} from "react";
import {MyInput} from "../ui/MyInput";
import * as yup from 'yup';
import { useForm, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from "react-hot-toast";
import {Button, Field, Textarea} from "@fluentui/react-components";
import api from "../../api";
interface Paymant {
    iznosZaUplatu: number;
    desc?: string;
    datumIsplate: string;
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
        iznosZaUplatu: 0,
        datumIsplate : ''
    });


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({...prev,[name]:value}));
    };

    const daLiTrebaJosDaSeUplati = useCallback(()=>{
        return uplate.reduce((prev,curr)=>Number(prev) + Number(curr.amount),0) == ukupnoMenadzeru;
    },[uplate])

    const dohvatiMenadzeroveUplate = async ()=>{
        try{
            setLoading(true);
            const response = await api.get(`/menadzeri/isplate/${idMenadzera}`,{params:{studentId : id}});
            setUplate(response.data);
            setLoading(false);
        }
        catch (xhr){
            setLoading(false);
            if(xhr.status === 404){
                setError(xhr.response.data.message)
            }
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

            setForm({ iznosZaUplatu : 0,datumIsplate : '' });
            toast.success(response.data.message);
            onSuccess(true);
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
        iznosZaUplatu: yup
            .number()
            .typeError('Morate uneti cifru za plaćanje')
            .required('Morate uneti vrednost')
            .min(1, 'Vrednost mora biti veća od 0')
            .positive('Vrednost mora biti pozitivna'),
        desc : yup.string().nullable(),
        datumIsplate: yup.string().required('Morate uneti datum isplate')
    }).required();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Paymant>({
        resolver: yupResolver(schema) as Resolver<Paymant, object, Paymant>
    });
    console.log(daLiTrebaJosDaSeUplati())
    const prikaziOpisZaPlacanje = ()=>{
        if(hasDescription){
            return (
                <>
                    <Field name='desc' label="Unesite napomenu">
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
            <h3 className='text-lg my-2'>Menadzeru je ukupno potrebno isplatiti <strong>{ukupnoMenadzeru.toFixed(2)}&euro;</strong>,
                <span>
                    {!daLiTrebaJosDaSeUplati() ?
                        (<span className='block'> Preostalo: <strong>{preostaloMenadzeru.toFixed(2)}&euro;</strong></span>)
                        : (<span className='text-green-700 font-bold block'> Sve je plaćeno!</span>)
                    }
                </span>
            </h3>
            <form onSubmit={handleSubmit(onSubmit)}>

                <MyInput autoFocus  type='number' {...register('iznosZaUplatu')} label={'Unesite koliko je menadzeru isplaceno?'} name={'iznosZaUplatu'}></MyInput>
                {errors.iznosZaUplatu && <div className="text-red-900 text-shadow">{errors.iznosZaUplatu.message}</div>}
                <MyInput  {...register('datumIsplate')} type='datetime-local' label={'Datum kada menadzer dobio novac'} name={'datumIsplate'}/>
                {errors.datumIsplate && <div className="text-red-900 text-shadow">{errors.datumIsplate.message}</div>}
                {prikaziOpisZaPlacanje()}
                <div className='opis'>
                    <button type="button" onClick={dodajOpisZaPlacanje} className='!bg-[#0f6cbd] !text-gray-50 !py-1 !px-2 !text-xs my-2'>{hasDescription ? 'Ukloni' : 'Dodaj'} opis</button>
                </div>

                <Button className='!my-5' type="submit" disabled={loading || daLiTrebaJosDaSeUplati()}>
                    {loading ? 'Sačekajte...' : 'Dodaj iznos za uplatu'}
                </Button>
                {error && <div className="error text-red-900 font-bold my-3">{error}</div>}
            </form>
        </>
    );
}