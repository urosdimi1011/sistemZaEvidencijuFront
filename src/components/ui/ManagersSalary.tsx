import api from "../../api";
import {memo, useCallback, useEffect, useState} from "react";
import {formatMoney} from '../../utils/FormatMoney';
import Modal from "../modal/Modal";
import ManagersSalaryModal from "../modal/ManagersSalaryModal";
import {Button} from "@fluentui/react-components";
import {FilterFilled} from "@fluentui/react-icons/lib/fonts";

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

interface ManagerStudentsResponse {
    menadzer: {
        id: number;
        name: string;
    };
    data: UcenikZarada[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalStudents: number;
        studentsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

interface PaginationInfo {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
}

interface ManagersResponse {
    data: ManagersSalaryInterface[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

interface Option {
    id: number;
    label: string;
    value: string;
}

export const ManagersSalary = () => {
    const [managersResponse, setManagersResponse] = useState<ManagersResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [selectedManagerId, setSelectedManagerId] = useState(null);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        // Resetuj state kada se komponenta mount-uje
        setManagersResponse(null);
        getManagersSalary();
    }, [currentPage, itemsPerPage, searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const onPageChange = useCallback((newPage: number) => {
        setCurrentPage(newPage);
    }, []);

    const getManagersSalary = async () => {
        try {
            setLoading(true);

            let url = `/menadzeri/zarade?page=${currentPage}&limit=${itemsPerPage}`;
            if (searchTerm.trim()) {
                url += `&search=${encodeURIComponent(searchTerm.trim())}`;
            }

            const {data} = await api.get(url);
            setManagersResponse(data);
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            setErrorText(error.message);
        }
    };

    const handleSearchSubmit = () => {
        setSearchTerm(searchInput);
        setCurrentPage(1);
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    const clearSearch = () => {
        setSearchInput('');
        setSearchTerm('');
        setCurrentPage(1);
    };

    const closeModal = () => {
        setIsOpenModal(false);
    };

    const openModal = (managerId: number) => {
        setIsOpenModal(true);
        setSelectedManagerId(managerId); 
    };  

    const PaginationControls = () => {
        if (!managersResponse?.pagination) return null;

        const { pagination } = managersResponse;

        return (
            <div className="flex items-center justify-between bg-white px-6 py-4 border-t">
                <div className="text-sm text-gray-700">
                    Stranica {pagination.currentPage} od {pagination.totalPages}
                    (ukupno {pagination.totalItems} menadžera)
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        disabled={!pagination.hasPreviousPage || loading}
                        onClick={() => onPageChange(1)}
                        size="small"
                        appearance="subtle"
                    >
                        Prva
                    </Button>
                    <Button
                        disabled={!pagination.hasPreviousPage || loading}
                        onClick={() => onPageChange(pagination.currentPage - 1)}
                        size="small"
                        appearance="subtle"
                    >
                        Prethodna
                    </Button>

                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const startPage = Math.max(1, pagination.currentPage - 2);
                        const pageNumber = startPage + i;
                        if (pageNumber > pagination.totalPages) return null;

                        return (
                            <Button
                                key={pageNumber}
                                disabled={loading}
                                onClick={() => onPageChange(pageNumber)}
                                size="small"
                                appearance={pageNumber === pagination.currentPage ? "primary" : "subtle"}
                            >
                                {pageNumber}
                            </Button>
                        );
                    })}

                    <Button
                        disabled={!pagination.hasNextPage || loading}
                        onClick={() => onPageChange(pagination.currentPage + 1)}
                        size="small"
                        appearance="subtle"
                    >
                        Sledeća
                    </Button>
                    <Button
                        disabled={!pagination.hasNextPage || loading}
                        onClick={() => onPageChange(pagination.totalPages)}
                        size="small"
                        appearance="subtle"
                    >
                        Poslednja
                    </Button>
                </div>
            </div>
        );
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    if (errorText) return (
        <h3 className="text-red-500 p-4">{errorText}</h3>
    );

    return (
        <div className="space-y-6">
            <h1 className="!text-3xl font-bold mb-4 text-gray-700 text-shadow-2xs">Zarade menadžera</h1>

            <div className='border my-6 mx-10 border-gray-700/20 shadow-sm relative rounded bg-gray-100'>
                <div className='border-b border-r inline-block border-gray-700/20 px-5 shadow-xs'>
                    <h2 className='text-lg font-semibold flex items-center gap-2 text-gray-500'>
                        Filteri <FilterFilled />
                    </h2>
                </div>

                <div className="flex gap-4 mb-6 flex-wrap p-4">
                    <div className="flex gap-2 flex-1">
                        <input
                            type="text"
                            placeholder="Pretražite po imenu menadžera..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={handleSearchKeyPress}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button
                            onClick={handleSearchSubmit}
                            appearance="primary"
                            disabled={loading}
                        >
                            Pretraži
                        </Button>
                        <Button
                            onClick={clearSearch}
                            appearance="subtle"
                            disabled={loading}
                        >
                            Obriši
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow space-y-6">
                {managersResponse && managersResponse.pagination && (
                    <div className="ml-4 mb-4">
                        <h3 className="text-lg font-semibold">
                            Ukupan broj menadžera: {managersResponse.pagination.totalItems}
                        </h3>
                        {searchTerm && (
                            <p className="text-sm text-blue-600">
                                Aktivni filter: Ime: "{searchTerm}"
                            </p>
                        )}
                    </div>
                )}

                {!managersResponse?.data || managersResponse.data.length === 0 ? (
                    <div className="p-4">
                        <h3 className="text-gray-500">
                            {searchTerm ? 'Nema rezultata za zadatu pretragu' : 'Nema podataka o zaradama menadžera'}
                        </h3>
                    </div>
                ) : (
                    <>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Menadžer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Zarada po učeniku
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ukupna zarada
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {managersResponse.data.map((menadzer) => (
                                <tr key={menadzer.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{menadzer.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {menadzer.zaradaPoUceniku && menadzer.zaradaPoUceniku.length > 0 ? (
                                            <button
                                                onClick={() => openModal(menadzer.id)}
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

                        {/* Paginacija */}
                        {managersResponse.pagination.totalPages > 1 && <PaginationControls />}

                        {/* Items per page selector */}
                        <div className="flex justify-center mt-4">
                            <select
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                                className="border border-gray-300 rounded px-2 py-1"
                            >
                                <option value={5}>5 po stranici</option>
                                <option value={10}>10 po stranici</option>
                                <option value={20}>20 po stranici</option>
                                <option value={50}>50 po stranici</option>
                            </select>
                        </div>
                    </>
                )}

                <ManagersSalaryModal
                    isOpen={isOpenModal}
                    managerId={selectedManagerId}    
                    onClose={closeModal}
                />
            </div>
        </div>
    );
};