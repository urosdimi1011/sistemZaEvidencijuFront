import api from "../../api";
import {memo, useEffect, useState} from "react";
import {formatMoney} from '../../utils/FormatMoney';
import Modal from "../modal/Modal";
import ManagersSalaryModal from "../modal/ManagersSalaryModal";

interface UcenikZarada {
    id: number;
    imeIPrezimeUcenika: string;
    zarada: number;
    placeno: string;
    placeniIznos: number;
    preostalo: number;
}

interface ManagersSalaryInterface {
    id: number;
    name: string;
    zarada: number;
    zaradaPoUceniku: UcenikZarada[];
    ukupnoPlaceno: number;
    ukupnoPreostalo: number;
}

interface Option {
    id: number;
    label: string;
    value: string;
}

export const ManagersSalary = () => {
    const [states, setStates] = useState<ManagersSalaryInterface[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [selectedManager, setSelectedManager] = useState<ManagersSalaryInterface | null>(null);
    const [isOpenModal, setIsOpenModal] = useState(false);
    useEffect(() => {
        getManagersSalary();
    }, []);

    const getManagersSalary = async () => {
        try {
            setLoading(true);
            const {data} = await api.get('/menadzeri/zarade');
            setStates(data);
            setLoading(false);

            if (data.availableYears) {
                const yearOptions = data.availableYears.map((year: number) => ({
                    id: year,
                    value: year.toString(),
                    label: `Godina ${year}`
                }));
                // setAvailableYears(yearOptions);
            }
        } catch (error: any) {
            setLoading(false);
            setErrorText(error.message);
        }
    };

    const closeModal = () => {
        setIsOpenModal(false);
        setTimeout(() => setSelectedManager(null), 300);
    };
    const openModal = (menadzer)=>{
        setIsOpenModal(true);
        setTimeout(() => setSelectedManager(menadzer), 300);
    }
    // Za zatvaranje modala ESC tipkom
    // useEffect(() => {
    //     // const handleEsc = (event: KeyboardEvent) => {
    //     //     if (event.key === 'Escape') {
    //     //         closeModal();
    //     //     }
    //     // };
    //
    //     window.addEventListener('keydown', handleEsc);
    //     return () => window.removeEventListener('keydown', handleEsc);
    // }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    if (errorText) return (
        <h3 className="text-red-500 p-4">{errorText}</h3>
    );

    if (!states || states.length === 0) return (
        <div className="p-4">
            <h3 className="text-gray-500">Nema podataka o zaradama menadžera</h3>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Zarade menadžera</h2>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menadžer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zarada po učeniku</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ukupna zarada</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {states.map((menadzer) => (
                    <tr key={menadzer.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{menadzer.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            {menadzer.zaradaPoUceniku && menadzer.zaradaPoUceniku.length > 0 ? (
                                <button
                                    onClick={() => openModal(menadzer)}
                                    className="text-[#0f6cbd] hover:text-[#0f6cbd] text-sm"
                                >
                                    {menadzer.zaradaPoUceniku.length} učenika
                                </button>
                            ) : (
                                <span className="text-gray-500 italic">Nema učenika</span>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <strong>{formatMoney(menadzer.zarada)}</strong>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
             <ManagersSalaryModal
                isOpen={isOpenModal}
                selectedManager={selectedManager}
                onClose={closeModal}
            />

        </div>
    );
};