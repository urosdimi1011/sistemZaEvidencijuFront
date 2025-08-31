import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { Spinner } from "@fluentui/react-components";
import api from '../api';
import toast from 'react-hot-toast';
import StudentsToolbar from "../components/ui/students/StudentsToolbar";
import StudentsTable from "../components/table/StudentsTable";
import StudentsModal from "../components/ui/students/StudentsModal";
import {date} from "yup";

const EmptyState = lazy(() => import('../components/ui/EmptyState'));

export default function StudentsCore() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
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

    // Fetch students
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                let response = null;
                if(datePicker){
                    response = await api.get(`/students?date=${datePicker}`);
                }
                else{
                    response = await api.get("/students");

                }
                setStudents(response.data);
            } catch (error) {
                toast.error('Došlo je do greške pri učitavanju studenata');
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [datePicker]);

    // Filter students with debounce
    const filteredStudents = useMemo(() => {
        if (!currentTextSearch) return students;
        return students.filter(student =>
            `${student.ime} ${student.prezime}`
                .toLowerCase()
                .includes(currentTextSearch.toLowerCase())
        );
    }, [students, currentTextSearch]);

    // Handlers with useCallback
    const handleAddStudent = useCallback(() => {
        setModalConfig({
            viewType: 'add',
            student: null,
            title: 'Dodaj novog učenika'
        });
        setIsModalOpen(true);
    }, []);

    const handleSearchChange = useCallback((e) => {
        setCurrentTextSearch(e.target.value);
    }, []);

    const handleDateSearch = useCallback((date)=>{
        setDatePicker(date?.toLocaleDateString('en-CA'))
    },[])

    const handleSuccess = useCallback((type, data) => {
        if (type === 'add') {
            setStudents(prev => [data,...prev]);
            toast.success('Uspešno ste dodali novog studenta', { duration: 3000 });
        } else if (type === 'edit') {
            setStudents(prev => prev.map(s => s.id === data.id ? data : s));
            toast.success('Uspešno ste izmenili studenta', { duration: 3000 });
        }
        else if (type === 'delete') {
            console.log(data);
            setStudents(prev => prev.filter(s => s.id !== data.data.id));
            toast.success('Uspešno ste obrisali studenta', { duration: 3000 });
        }
        setIsModalOpen(false);
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
    }, [])

    const handleDeleteStudent = useCallback((student) => {
        setModalConfig({
            viewType: 'delete',
            student: student,
            title: `Brisanje studenta (${student.ime} ${student.prezime})`
        });
        setIsModalOpen(true);
    }, [])

    if (loading) return <Spinner className="mt-10" />;

    return (
        <div className="space-y-6">
            <StudentsToolbar
                onAdd={handleAddStudent}
                searchValue={currentTextSearch}
                onDateChange={handleDateSearch}
                onSearchChange={handleSearchChange}
                onToggleColor={() => setColoredRows(!coloredRows)}
                onToggleManagerColor={() => setColoredManagerRows(!coloredManagerRows)}
                coloredRows={coloredRows}
                coloredManagerRows={coloredManagerRows}
            />

            {filteredStudents.length > 0 ? (
                <StudentsTable
                    studenti={filteredStudents}
                    kliknutiRed={handleRowClick}
                    obojeniRedovi={coloredRows}
                    obojeniRedoviZaMenadzere={coloredManagerRows}
                    kliknutoNaDugmeDelete={handleDeleteStudent}
                    kliknutoNaDugmeEdit={handleEditStudent}
                />
            ) : (
                <Suspense fallback={<Spinner />}>
                    <EmptyState message="Nema učitanih studenata" />
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