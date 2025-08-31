import axios from 'axios';
import {useState} from "react";
import {MyInput} from "../ui/MyInput";
import * as yup from 'yup';
import { useForm, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import api from "../../api";
interface Menadzer {
    ime: string;
    prezime: string;
}

interface AddMenadzerFormProps {
    onSuccess?: (noviMenadzer: Menadzer) => void;
}


export default function AddMenadzerForm({ onSuccess } : AddMenadzerFormProps) {
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
            console.log(form);
            const response = await api.post<Menadzer>(
                '/menadzeri',
                data
            );
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
        formState: { errors },
    } = useForm<Menadzer>({
        resolver: yupResolver(schema) as Resolver<Menadzer, object, Menadzer>
    });
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {error && <div className="error">{error}</div>}

            <MyInput {...register('ime')} label={'Unesite ime menadzera'} name={'ime'} onChange={handleChange}></MyInput>
            {errors.ime && <div className="text-red-900 text-shadow">{errors.ime.message}</div>}
            <MyInput {...register('prezime')} label={'Unesite prezime menadzera'} name={'prezime'} onChange={handleChange}></MyInput>
            {errors.prezime && <div className="text-red-900">{errors.prezime.message}</div>}
            <button type="submit" disabled={loading}>
                {loading ? 'Sačekajte...' : 'Dodaj Menadžera'}
            </button>
        </form>
    );
}