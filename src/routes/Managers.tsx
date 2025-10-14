import {Suspense, useCallback, useEffect, useState} from 'react';
import axios from 'axios';
import Spinner from '../components/ui/Spinner';
import Modal from "../components/modal/Modal";
import AddMenadzerForm from "../components/forms/AddMenadzerForm";
import MenadzerTable from "../components/table/MenadzerTable";
import api from "../api";
import StudentsModal from "../components/ui/students/StudentsModal";
import ManagerModal from "../components/modal/manager/ManagerModal";
import toast from "react-hot-toast";
import EmptyState from "../components/ui/EmptyState";
import {Button} from "@fluentui/react-components";
import {FilterFilled, Search24Regular} from "@fluentui/react-icons/lib/fonts";
import {MyInput} from "../components/ui/MyInput";

interface Menadzer {
    id?: number;
    ime: string;
    prezime: string;
    datumKreiranja: string;
    datumIzmene: string;
    students: object,
    studentsCount : number;
}

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

function Managers() {
    const [count, setCount] = useState(0)
    const [menadzeri, setMenadzeri] = useState<Menadzer[]>([]);
    const imaLiMenadzera = !!menadzeri.length;
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [modalConfig, setModalConfig] = useState({
        viewType: 'add',
        menadzer: null,
        title: 'Dodaj novog menadzera'
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);


    const getPageNumbers = () => {
        if (!pagination) return [];

        const { currentPage, totalPages } = pagination;
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    const fetchManagers = async (page = 1) => {
        try {
            setLoading(true);
            const params: any = {
                page: page,
                search: searchTerm
            };
            const {data} = await api.get<Menadzer[]>('/menadzeri',{params});
            setMenadzeri(data?.managers);
            setPagination(data?.pagination)
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchManagers();
    }, [debouncedSearchTerm,currentPage]);

    const handleSuccess = useCallback((type, data) => {
        if (type === 'add') {
            fetchManagers(pagination.currentPage);
            setMenadzeri(prev => [data,...prev]);
            toast.success('Uspešno ste dodali novog studenta', { duration: 3000 });
        } else if (type === 'edit') {
            setMenadzeri(prev => prev.map(s => s.id === data.id ? data : s));
            toast.success('Uspešno ste izmenili menadzera', { duration: 3000 });
            fetchManagers(pagination.currentPage);
        }
        else if (type === 'delete') {
            setMenadzeri(prev => prev.filter(s => s.id !== data.data.id));
            toast.success('Uspešno ste obrisali menadzera', { duration: 3000 });
            fetchManagers(pagination.currentPage);
        }
        setIsModalOpen(false);
    }, [pagination?.currentPage, fetchManagers]);

    const handleDeleteStudent = useCallback((menadzer) => {
        setModalConfig({
            viewType: 'delete',
            menadzer: menadzer,
            title: `Brisanje menadzera (${menadzer.ime} ${menadzer.prezime})`
        });
        setIsModalOpen(true);
    }, [])

    const handleDetailsStudent = useCallback((menadzer) => {
        setModalConfig({
            viewType: 'details',
            menadzer: menadzer,
            title: `Menadžer (${menadzer.ime} ${menadzer.prezime})`
        });
        setIsModalOpen(true);
    }, [])

    const handleAddManager = useCallback(()=>{
        setModalConfig({
            viewType: 'add',
            menadzer: null,
            title: `Dodajte menadžera`
        });
        setIsModalOpen(true);
    },[])

    const handleEditManager = useCallback((menadzer)=>{
        setModalConfig({
            viewType: 'edit',
            menadzer: menadzer,
            title: `Izmeni menadžera (${menadzer.ime} ${menadzer.prezime})`
        });
        setIsModalOpen(true);
    },[])

    const handlePageChange = useCallback((newPage: number) => {
        fetchManagers(newPage);
    }, [fetchManagers]);
    if(loading){
        return <Spinner />;
    }

    return (
        <div className='space-y-6'>

            <div className='border my-6 mx-10 border-gray-700/20 shadow-sm relative rounded bg-gray-100'>
                <div className='border-b border-r inline-block border-gray-700/20 px-5 shadow-xs'>
                    <h2 className='text-lg font-semibold flex items-center gap-2 text-gray-500'>Filteri <FilterFilled /></h2>
                </div>
                <div className='flex items-center flex-wrap gap-4 p-4'>
                    <Button onClick={handleAddManager}>Dodaj menadzera</Button>
                    <MyInput
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Pretraži menadžere..."
                        contentBefore={<Search24Regular />}
                        className='!w-1/2 min-w-[300px]'
                    />
                </div>

            </div>

            {imaLiMenadzera ? (
                <MenadzerTable
                    menadzeri={menadzeri}
                    kliknutoNaDugmeDelete={handleDeleteStudent}
                    kliknutoNaDugmeEdit={handleEditManager}
                    loading={loading}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    kliknutiRed={handleDetailsStudent}
                ></MenadzerTable>
            ) : (
                <Suspense fallback={<Spinner />}>
                    <EmptyState message="Nema učitanih menadžera" />
                </Suspense>
            )}

            <ManagerModal
                isOpen={isModalOpen}
                config={modalConfig}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
            />
        </div>
    )
}

export default Managers
