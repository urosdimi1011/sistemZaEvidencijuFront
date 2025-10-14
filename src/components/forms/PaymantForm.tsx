import axios from 'axios';
import {useState} from "react";
import {MyInput} from "../ui/MyInput";
import * as yup from 'yup';
import { useForm, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from "react-hot-toast";
import api from "../../api";
import {Button, Field, Textarea} from "@fluentui/react-components";
interface Paymant {
    iznosZaUplatu: number;
    datumUplate : string;
    note : string;
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
        iznosZaUplatu: 0,
        datumUplate : '',
        note : ''
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({...prev,[name]:value}));
    };


    const onSubmit = async (data : Paymant)=>{

        const transformedData = {
            ...data,
            iznosZaUplatu: isNaN(data.iznosZaUplatu) ? 0 : data.iznosZaUplatu
        };

        setLoading(true);
        setError(null);

        try {
            const response = await api.post<PaymantResponse>(
                `/payments/${id}`,
                transformedData
            );
            setLoading(false);

            setForm({ iznosZaUplatu : 0,datumUplate : '', note : '' });
            onSuccess(true);
            toast.success(response.data.message);
        } catch (err: any) {
            setLoading(false);
            setError(err.response?.data?.message || err.message);
        }
    }
    const schema = yup.object({
        iznosZaUplatu: yup
            .number()
            .typeError('Morate uneti cifru za plaćanje')
            .required('Morate uneti vrednost')
            .min(1, 'Vrednost mora biti veća od 0')
            .positive('Vrednost mora biti pozitivna'),
        datumUplate: yup
            .string()
            .required('Morate uneti datum uplate'),
        note : yup.string().nullable()
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

            <MyInput autoFocus type='number' {...register('iznosZaUplatu',
                { valueAsNumber: true,
                        validate: value => !isNaN(value) || "Molimo unesite valjan broj",
                        setValueAs: value => value === "" ? 0 : Number(value) }
            )}
                     label={'Unesite koliko je učenik uplatio?'}
                     name={'iznosZaUplatu'}></MyInput>
            {errors.iznosZaUplatu && <div className="text-red-900 text-shadow">{errors.iznosZaUplatu.message}</div>}

            <MyInput  {...register('datumUplate')} type='datetime-local' label={'Datum kada je uplatio'} name={'datumUplate'}/>
            {errors.datumUplate && <div className="text-red-900 text-shadow">{errors.datumUplate.message}</div>}

            <Field label="Unesite napomenu (opciono)">
                <Textarea placeholder="Unesite napomenu..." {...register('note')}/>
            </Field>
            {errors.note && <div className="text-red-900 text-shadow">{errors.note.message}</div>}

            <Button className='!my-5' type="submit" disabled={loading}>
                {loading ? 'Sačekajte...' : 'Dodaj iznos za uplatu'}
            </Button>
            {error && <div className="error text-red-900 font-bold my-3">{error}</div>}

        </form>
    );
}