import { useState } from "react";
import { MyInput } from "../ui/MyInput";
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import api from "../../api";
import { Button } from "@fluentui/react-components";
import MyDropdown from "../ui/MyDropdown";

interface User {
    id?: number;
    email: string;
    role: 'admin' | 'school_manager' | 'korisnik';
    schoolId?: number | null;
    schoolName?: string | null;
    passwordMy?: string| null
}

interface School {
    id: number;
    name: string;
}

interface AddUserFormProps {
    onSuccess?: (noviUser: User) => void;
    user?: User;
    schools: School[];
}

export default function AddUserForm({ onSuccess, user, schools }: AddUserFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = Boolean(user?.id); // Dodato za yup context


    const schema = yup.object({
        email: yup.string().email('Unesite validnu email adresu').required('Email je obavezan'),
        passwordMy: yup.string()
            .when('$isEditMode', {
                is: false, // Za nove korisnike
                then: (schema) => schema
                    .min(6, 'Lozinka mora imati najmanje 6 karaktera')
                    .required('Lozinka je obavezna za novog korisnika'),
                otherwise: (schema) => schema // Za postojeće korisnike
                    .min(6, 'Lozinka mora imati najmanje 6 karaktera')
                    .nullable()
                    .transform((value) => value || null)
            }),
        role: yup.string().oneOf(['admin', 'school_manager', 'korisnik'], 'Izaberite validnu ulogu').required('Uloga je obavezna'),
        schoolId: yup.number().nullable()
            .when('role', {
                is: 'school_manager',
                then: (schema) => schema.required('Škola je obavezna za menadžera škole'),
                otherwise: (schema) => schema.nullable()
            }),
    }).required();

    const { register, handleSubmit, formState: { errors }, control, setValue, watch } = useForm({
        resolver: yupResolver(schema),
        context: { isEditMode },
        defaultValues: user || {
            email: '',
            role: 'korisnik',
            schoolId: null,
            passwordMy: ''
        }
    });

    const selectedRole = watch('role');

    const onSubmit = async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            let response = null;

            // Ako je uloga nije school_manager, postavljamo schoolId na null
            if (data.role !== 'school_manager') {
                data.schoolId = null;
            }

            if(data.passwordMy == ''){
                data.passwordMy = null
            }

            if (user !== undefined && user.id) {
                response = await api.patch(`/users/${user.id}`, data, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
            } else {
                response = await api.post('/users', data);
            }

            setLoading(false);

            // Obavesti roditelja o uspehu
            if (onSuccess) onSuccess(response.data);

        } catch (err: any) {
            setLoading(false);
            setError(err.response?.data?.message || err.message || 'Došlo je do greške');
        }
    }

    const roleOptions = [
        { value: 'admin', label: 'Administrator' },
        { value: 'school_manager', label: 'Menadžer škole' },
        { value: 'korisnik', label: 'Korisnik' }
    ];

    const schoolOptions = schools.map(school => ({
        value: school.id,
        label: school.name
    }));

    // Dodaj opciju za praznu školu
    schoolOptions.unshift({ value: null, label: 'Izaberite školu' });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="error-message p-2 bg-red-100 text-red-700 rounded">{error}</div>}

            <div className="form-group">
                <MyInput
                    {...register('email')}
                    control={control}
                    label="Email adresa"
                    placeholder="Unesite email adresu"
                    type="email"
                    error={errors.email?.message}
                />
                {errors.email && <div className="error-text text-red-600 text-sm">{errors.email.message}</div>}
            </div>

            <div className="form-group">
                <MyInput
                    {...register('passwordMy')}
                    control={control}
                    label={isEditMode ? "Promenite korisniku lozinku" : "Lozinka"}
                    type="password"
                    error={errors.passwordMy?.message}
                />
                {errors.passwordMy && <div className="error-text text-red-600 text-sm">{errors.passwordMy.message}</div>}
                {isEditMode && (
                    <div className="text-sm text-gray-500 mt-1">
                        Ostavite prazno ako ne želite da promenite lozinku
                    </div>
                )}
            </div>

            <div className="form-group">

                <MyDropdown
                    label="Uloga"
                    id="role"
                    name="role"
                    options={roleOptions}
                    value={watch('role')}
                    onChange={(val) => setValue('role', val.value, { shouldValidate: true })}
                />
                {errors.role && <div className="error-text text-red-600 text-sm">{errors.role.message}</div>}
            </div>

            {selectedRole === 'school_manager' && (
                <div className="form-group">
                    <MyDropdown
                        label="Škola"
                        id="schoolId"
                        name="schoolId"
                        options={schoolOptions}
                        value={watch('schoolId')}
                        onChange={(val) => setValue('schoolId', val.value, { shouldValidate: true })}
                    />
                    {errors.schoolId && <div className="error-text text-red-600 text-sm">{errors.schoolId.message}</div>}
                </div>
            )}

            <div className="flex justify-end pt-4">
                <Button
                    appearance="primary"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Sačekajte...' : user !== undefined ? 'Ažuriraj korisnika' : 'Dodaj korisnika'}
                </Button>
            </div>
        </form>
    );
}