import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Spinner } from "@fluentui/react-components";
import api from '../api';
import toast from 'react-hot-toast';
import StudentsToolbar from "../components/ui/students/StudentsToolbar";
import StudentsTable from "../components/table/StudentsTable";
import StudentsModal from "../components/ui/students/StudentsModal";
import { usePermissions } from "./ProtectedRoute";

const EmptyState = lazy(() => import('../components/ui/EmptyState'));

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
interface Menadzer {
    "id": number,
    "ime": string,
    "prezime": string,
    "datumKreiranja": string,
    "datumIzmene": string
}
interface Student {
    "id": number,
    "ime": string,
    "imeRoditelja": string,
    "prezime": string,
    "datumKreiranja": string,
    "type": string,
    "entry_type": string,
    "note": string,
    "literature": boolean,
    "zanimanje": object,
    "cenaSkolarine": number,
    "literatureCost": number,
    "ukupanDug": number,
    "preostaliDug": number,
    "preostaliDugZaMenadzera": number,
    "procenatMenadzeru": number,
    "menadzer": Menadzer,
    "schoolId": number
}

interface ResponseObjectOfStudent {
    "data": Student[],   
    "pagination": PaginationInfo,
    "filters": object,
    "sorting": object
}

export default function StudentsCore() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20,
        hasNextPage: false,
        hasPrevPage: false
    });


    const [itemsPerPage, setItemsPerPage] = useState(20);


    const [currentTextSearch, setCurrentTextSearch] = useState('');
    const [datePicker, setDatePicker] = useState('');

    const [coloredRows, setColoredRows] = useState(false);
    const [coloredManagerRows, setColoredManagerRows] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        viewType: 'add',
        student: null,
        title: 'Dodaj novog učenika'
    });

    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

    const [stats, setStats] = useState({ totalStudents: 0, todayStudents: 0 });

    const {
        isAdmin,
        isSchoolManager,
        canManageStudents,
        schoolId
    } = usePermissions();

    const [debouncedSearch, setDebouncedSearch] = useState(currentTextSearch);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(currentTextSearch);
        }, 500);

        return () => clearTimeout(timer);
    }, [currentTextSearch]);

    const fetchStudents = useCallback(async (page = 1, resetSearch = false) => {
        const controller = new AbortController();
        try {
            setLoading(true);
            const params: any = {
                page: page,
                limit: itemsPerPage,
                sortBy: sortBy,
                sortOrder: sortOrder
            };

            if (debouncedSearch && !resetSearch) {
                params.search = debouncedSearch;
            }
            if (datePicker) {
                params.date = datePicker;
            }

            if (isSchoolManager && schoolId) {
                params.schoolId = schoolId;
            }

            const response =  await api.get<ResponseObjectOfStudent>("/students", { params });

            setStudents(response.data.data);
            setPagination(response.data.pagination);

        } catch (error) {
            toast.error('Došlo je do greške pri učitavanju studenata');
            console.error(error);
        } finally {
            setLoading(false);
        }

        return ()=>controller.abort();
    }, [debouncedSearch, datePicker, itemsPerPage, sortBy, sortOrder, isSchoolManager, schoolId]);

    const fetchStats = useCallback(async () => {
        try {
            const params: any = {};
            if (isSchoolManager && schoolId) {
                params.schoolId = schoolId;
            }
            const response = await api.get("/students/stats", { params });
            setStats(response.data);
        } catch (error) {
            console.error('Greška pri učitavanju statistika:', error);
        }
    }, [isSchoolManager, schoolId]);

    useEffect(() => {
        fetchStudents(1);
    }, [debouncedSearch, datePicker, sortBy, sortOrder, isSchoolManager, schoolId]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);



    const handleSearchChange = useCallback((e) => {
        setCurrentTextSearch(e.target.value);
        // Reset na prvu stranicu kada se search menja
    }, []);

    const handleDateSearch = useCallback((date) => {
        if (date) {
            setDatePicker(date.toLocaleDateString('en-CA'));
        } else {
            setDatePicker('');
        }
        }, []);

    const handlePageChange = useCallback((newPage: number) => {
        fetchStudents(newPage);
    }, [fetchStudents]);

    const handleItemsPerPageChange = useCallback((newLimit: number) => {
        setItemsPerPage(newLimit);
        setPagination(prev => ({ ...prev, itemsPerPage: newLimit }));
        fetchStudents(1);
    }, [fetchStudents]);

    const handleSort = useCallback((field: string) => {
        const newOrder = (sortBy === field && sortOrder === 'DESC') ? 'ASC' : 'DESC';
        setSortBy(field);
        setSortOrder(newOrder);
    }, [sortBy, sortOrder]);

    const handleSuccess = useCallback((type, data) => {
        if (type === 'add') {
            fetchStudents(pagination.currentPage);
            fetchStats();
            toast.success('Uspešno ste dodali novog studenta', { duration: 3000 });
        } else if (type === 'edit') {
            setStudents(prev => prev.map(s => s.id === data.id ? data : s));
            toast.success('Uspešno ste izmenili studenta', { duration: 3000 });
        } else if (type === 'delete') {
            fetchStudents(pagination.currentPage);
            fetchStats();
            toast.success('Uspešno ste obrisali studenta', { duration: 3000 });
        }
        else if( type === 'editPayment'){
            fetchStudents(pagination.currentPage);
        }
        setIsModalOpen(false);
    }, [fetchStudents, fetchStats, pagination?.currentPage]);

    const handleAddStudent = useCallback(() => {
        setModalConfig({
            viewType: 'add',
            student: null,
            title: 'Dodaj novog učenika'
        });
        setIsModalOpen(true);
    }, []);

    const handleRowClick = useCallback((student) => {
        setModalConfig({
            viewType: 'details',
            student: student.id,
            title: `Pregled studenta (${student.ime} ${student.prezime})`
        });
        setIsModalOpen(true);
    }, []);

    const handleEditStudent = useCallback((student) => {
        setModalConfig({
            viewType: 'edit',
            student: student,
            title: `Izmena studenta (${student.ime} ${student.prezime})`
        });
        setIsModalOpen(true);
    }, []);

    const handleDeleteStudent = useCallback((student) => {
        setModalConfig({
            viewType: 'delete',
            student: student,
            title: `Brisanje studenta (${student.ime} ${student.prezime})`
        });
        setIsModalOpen(true);
    }, []);

    const setColoredRowsFunc = useCallback((val : any)=>{
        setColoredRows(val);
        setColoredManagerRows(false);
    },[])
    
    const setColoredManagerRowsFunc = useCallback((val : any)=>{
        setColoredManagerRows(val);
        setColoredRows(false);
    },[])

    if (loading && students.length === 0) {
        return <Spinner className="mt-10" />;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {stats.totalStudents}
                        </div>
                        <div className="text-gray-600">Ukupno učenika</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {stats.todayStudents}
                        </div>
                        <div className="text-gray-600">Dodano danas</div>
                    </div>
                </div>
            </div>

            <StudentsToolbar
                onAdd={handleAddStudent}
                searchValue={currentTextSearch}
                onDateChange={handleDateSearch}
                selectedDate={datePicker ? new Date(datePicker) : null}
                onSearchChange={handleSearchChange}
                onToggleColor={() => setColoredRowsFunc(!coloredRows)}
                onToggleManagerColor={() => setColoredManagerRowsFunc(!coloredManagerRows)}
                coloredRows={coloredRows}
                coloredManagerRows={coloredManagerRows}
            />

            {!loading || students.length > 0 ? (
                    <StudentsTable
                        isAdmin={isAdmin}
                        isSchoolManager={isSchoolManager}
                        studenti={students}
                        kliknutiRed={handleRowClick}
                        obojeniRedovi={coloredRows}
                        obojeniRedoviZaMenadzere={coloredManagerRows}
                        kliknutoNaDugmeDelete={handleDeleteStudent}
                        kliknutoNaDugmeEdit={handleEditStudent}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                        onSort={handleSort}
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        loading={loading}
                    />
            ) : (
                <Suspense fallback={<Spinner />}>
                    <EmptyState message="Učitava učenike..." />
                </Suspense>
            )}

            <StudentsModal
                isOpen={isModalOpen}
                config={modalConfig}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
            />
        </div>
    );
}