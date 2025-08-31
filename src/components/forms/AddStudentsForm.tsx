import axios from 'axios';
import {useEffect, useState} from "react";
import {MyInput} from "../ui/MyInput";
import * as yup from 'yup';
import {useForm, Resolver, Controller} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import MyDropdown from "../ui/MyDropdown";

import Select from 'react-select';

import toast from "react-hot-toast";
import {StringDecoder} from "string_decoder";
import api from "../../api";
import OccupationDropdown from "../ui/OccupationDropdown";
interface Student {
    id?: number;
    ime: string;
    prezime: string;
    imeRoditelja: string;
    zanimanje: number;
    managerId: number;
    cenaSkolarine: number;
    procenatManagera: number;
}
interface AddStudentFormProps {
    onSuccess?: (noviStudent: Student) => void;
    student?: Student
}

interface Option {
    value: number;
    label: string;
}

interface OptionWithLabel {
    label:string,
    options: {
        value : string,
        label: string
    }
}


export default function AddStudentsForm({ onSuccess, student } : AddStudentFormProps) {
    const [loading, setLoading] = useState(false);
    const [menadzeri, setMenadzeri] = useState<Option[]>([]);
    const [zanimanja, setZanimanja] = useState<OptionWithLabel[]>([]);
    const [error, setError] = useState<string | null>(null);
    const schema = yup.object({
        ime: yup.string()
            .trim()
            .max(255, 'Ime ne sme biti duže od 255 karaktera')
            .min(2,'Ime mora imati vise od 2 karaktera'),
        prezime: yup.string()
            .trim()
            .max(255, 'Prezime ne sme biti duže od 255 karaktera')
            .min(2,'Prezime mora imati vise od 2 karaktera'),
        imeRoditelja:  yup.string()
            .trim()
            .max(255, 'Ime roditelja ne sme biti duže od 255 karaktera')
            .min(2,'Ime roditelja mora imati vise od 2 karaktera'),
        zanimanje: yup.number().required('Zanimanje je obavezno'),
        managerId: yup.number().required('Menadzer je obavezno'),
        cenaSkolarine: yup.number().required('Cena školarine je obavezno'),
        procenatManagera: yup.number().required('Procenat menadzeru je obavezno'),
    });
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<Student>({
        resolver: yupResolver(schema),
        defaultValues: student !== undefined ? {...student,procenatManagera : student.procenatMenadzeru,managerId: student.menadzer.id,zanimanje : student.zanimanje?.id} : {
            ime: '',
            prezime: '',
            imeRoditelja: '',
            zanimanje: null,
            managerId: null,
            cenaSkolarine: null,
            procenatManagera: null
        }
    });
    const getManagers = async ()=>{
        const response = await api.get('/menadzeri');
        const list = Array.isArray(response.data)
            ? response.data
            : response.data.menadzeri;

        const mapped: Option[] = list.map(m => ({
            value: m.id,
            label: `${m.ime} ${m.prezime}`,
        }));

        setMenadzeri(mapped);
    }

    const getOccupations = async ()=>{
        try{
            const response = await api.get('/occupations');

            const list = response.data

            const mapped: OptionWithLabel[] = list.map(m => ({
                label: m.name,
                options : m.occupations.map(s=> ({
                    label: s.name,
                    value : s.id
                }))
            }));
            setZanimanja(mapped)
        }
        catch (error){
            toast.error(error.message);
        }
    }
    useEffect(()=>{
        console.log(student);
        (async () => {
            await getManagers();
            await getOccupations();
        })()
    },[])

    const onSubmit = async (values)=>{

        values = prepareValueForSending(values);
        try{
            let response = null;
            if(student !== undefined){
                console.log(values);
                response = await api.patch(`/students/${student.id}`,values,{
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
            }
            else{
                response = await api.post('/students',values,{
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
            }
            onSuccess(response.data);
        }
        catch (error){
            const errorMessage = error.response?.data?.error?.detail ||
                error.detail ||
                `Došlo je do greške prilikom slanja podataka, Poruka(${error.message})`;
            toast.error(errorMessage);
        }
    }

    const prepareValueForSending = (data)=>{
        return {
            ime: data.ime,
            prezime: data.prezime,
            occupation: parseInt(data.zanimanje),
            managerId: data.managerId,
            cenaSkolarine: data.cenaSkolarine,
            imeRoditelja: data.imeRoditelja,
            procenatManagera: data.procenatManagera
        }
    }

    return (
        <>
            <form key={student?.id || "new-student"} onSubmit={handleSubmit(onSubmit)}>
                {error && <div className="error">{error}</div>}

                <MyInput {...register('ime')} control={control}  label={'Unesite ime ucenika'} name={'ime'}></MyInput>
                {errors.ime && <div className="text-red-900 text-shadow">{errors.ime.message}</div>}

                <MyInput {...register('imeRoditelja')} control={control} label={'Unesite ime roditelja'} name={'imeRoditelja'}></MyInput>
                {errors.imeRoditelja && <div className="text-red-900">{errors.imeRoditelja.message}</div>}

                <MyInput {...register('prezime')} control={control} label={'Unesite prezime ucenika'} name={'prezime'}></MyInput>
                {errors.prezime && <div className="text-red-900">{errors.prezime.message}</div>}



                <Controller
                    control={control}
                    name="zanimanje"
                    render={({ field }) => (
                        <OccupationDropdown {...field} name='zanimanje' occupationOptions={zanimanja} onOccupationSelect={(val) => field.onChange(val.value)}/>
                    )}
                />

                {errors.zanimanje && <div className="text-red-900">{errors.zanimanje.message}</div>}

                <MyInput type='number' {...register('cenaSkolarine')} control={control} label={'Unesite Cenu skolarine za studenta'} name={'cenaSkolarine'} ></MyInput>
                {errors.cenaSkolarine && <div className="text-red-900">{errors.cenaSkolarine.message}</div>}

                <Controller
                    control={control}
                    name="managerId"
                    render={({ field }) => (
                        <>
                            <MyDropdown
                                label="Izaberite menadžera"
                                id="managerId"
                                name="managerId"
                                options={menadzeri}
                                value={field.value}
                                onChange={(val) => field.onChange(val.value)}
                            />
                        </>

                    )}
                />
                {errors.managerId && <div className="text-red-900">{errors.managerId.message}</div>}

                <Controller
                    control={control}
                    name="procenatManagera"
                    render={({ field }) => (
                        <MyDropdown
                            label="Izaberite procenat za menadzera"
                            placeHolder='Izaberite procenat za menadzera'
                            name="procenatManagera"
                            id="procenatManagera"
                            {...field}
                            options={[
                                {
                                    value: 5,
                                    label: '5%',
                                },
                                {
                                    value: 10,
                                    label: '10%',
                                },
                                {
                                    value: 15,
                                    label: '15%',
                                },
                                {
                                    value: 20,
                                    label: '20%',
                                    selected: true
                                },
                                {
                                    value: 25,
                                    label: '25%',
                                },
                                {
                                    value : 30,
                                    label: '30%'
                                },
                                {
                                    value : 40,
                                    label: '40%'
                                }
                            ]}
                            onChange={(val) => field.onChange(val.value)}
                        />
                    )}
                />

                {errors.procenatManagera && <div className="text-red-900">{errors.procenatManagera.message}</div>}



                <button className='my-5' type="submit" disabled={loading}>
                    {loading ? 'Sačekajte...' : student !== undefined ? 'Azuriraj učenika' : 'Dodaj učenika'}
                </button>
            </form>
        </>
    );
}
