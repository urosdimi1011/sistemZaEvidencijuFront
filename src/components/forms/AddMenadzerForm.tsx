import axios from 'axios';
import {useState} from "react";
import {MyInput} from "../ui/MyInput";
import * as yup from 'yup';
import { useForm, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import api from "../../api";
import {Button} from "@fluentui/react-components";
interface Menadzer {
    id?:number;
    ime: string;
    prezime: string;
}

interface AddMenadzerFormProps {
    onSuccess?: (noviMenadzer: Menadzer) => void;
    menadzer? : Menadzer
}


export default function AddMenadzerForm({ onSuccess,menadzer } : AddMenadzerFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<Menadzer>({
        ime: '',
        prezime: '',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (data : Menadzer)=>{
        setLoading(true);
        setError(null);

        try {
            let response = null;

            if(menadzer !== undefined){
                response = await api.patch(`/menadzeri/${menadzer.id}`,data,{
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
            }
            else{
                console.log(form);
                response = await api.post<Menadzer>(
                    '/menadzeri',
                    data
                );
            }


            setLoading(false);

            // Obavesti roditelja o uspehu (npr. da osveži listu)
            if (onSuccess) onSuccess(response.data);

            // Reset forme
            setForm({ ime: '', prezime: '' });
        } catch (err: any) {
            setLoading(false);
            setError(err.response?.data?.message || err.message);
        }
    }
    const schema = yup.object({
        ime: yup.string().trim().min(2,'Morate uneti barem dva karaktera za ime').required('Ime je obavezno'),
        prezime: yup.string().min(2,'Morate uneti barem dva karaktera za prezime').trim().required('Prezime je obavezno'),
    }).required();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<Menadzer>({
        resolver: yupResolver(schema) as Resolver<Menadzer, object, Menadzer>,
        defaultValues: menadzer != null ? {ime : menadzer.ime, prezime : menadzer.prezime} : {ime : '',prezime: ''}
    });
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {error && <div className="error">{error}</div>}

            <MyInput {...register('ime')} control={control} label={'Unesite ime menadzera'} name={'ime'} onChange={handleChange}></MyInput>
            {errors.ime && <div className="text-red-900 text-shadow">{errors.ime.message}</div>}
            <MyInput {...register('prezime')} control={control} label={'Unesite prezime menadzera'} name={'prezime'} onChange={handleChange}></MyInput>
            {errors.prezime && <div className="text-red-900">{errors.prezime.message}</div>}
            <Button className='!mt-10 !mb-5' type="submit" disabled={loading}>
                {loading ? 'Sačekajte...' : menadzer !== undefined ? 'Edituj menadžera' : 'Dodaj menadžera'}
            </Button>
        </form>
    );
}