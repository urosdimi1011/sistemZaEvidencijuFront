import { Suspense, useEffect, useState, useCallback, memo } from 'react';
import Select from 'react-select';
import api from "../../api";
import {DismissCircleColor} from "@fluentui/react-icons";
import Modal from '../modal/Modal';
import { Spinner } from '@fluentui/react-components';

interface Student {
    id: number;
    ime: string;
    prezime: string;
    imeRoditelja: string;

    // dodaj ostala polja
}

interface SchoolEnrollmentData {
    schoolId: number;
    schoolName: string;
    months: {
        month: string;
        monthName: string;
        total: number;
        studentsByOccupation: { [key: string]: Student[] };
        byOccupation: { [key: string]: number };
    }[];
    occupations: {
        id: number;
        name: string;
    }[];
}

// Memoizovana tabela za škole
const SchoolTable = memo(({ 
    school, 
    onCellClick 
}: { 
    school: SchoolEnrollmentData; 
    onCellClick: (students: Student[]) => void; 
}) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">{school.schoolName}</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left">Smerovi</th>
                            {school.months.map((month, monthIndex) => (
                                <th 
                                    key={`month-header-${school.schoolId}-${month.month}-${monthIndex}`} 
                                    className="px-4 py-2 text-left"
                                >
                                    {month.monthName}
                                </th>
                            ))}
                            <th className="px-4 py-2 text-left">Ukupno</th>
                        </tr>
                    </thead>
                    <tbody>
                        {school.occupations.map((occupation, occupationIndex) => (
                            <OccupationRow 
                                key={`occupation-${school.schoolId}-${occupation.id}-${occupationIndex}`}
                                school={school}
                                occupation={occupation}
                                onCellClick={onCellClick}
                            />
                        ))}
                        <TotalRow school={school} />
                    </tbody>
                </table>
            </div>
        </div>
    );
});

const OccupationRow = memo(({ 
    school, 
    occupation, 
    onCellClick 
}: { 
    school: SchoolEnrollmentData; 
    occupation: any; 
    onCellClick: (students: Student[]) => void; 
}) => {
    return (
        <tr className="border-b">
            <td className="px-4 py-2 font-medium text-lg">{occupation.name}</td>
            {school.months.map((month, monthIndex) => (
                <TableCell 
                    key={`cell-${school.schoolId}-${occupation.id}-${month.month}-${monthIndex}`}
                    students={month.studentsByOccupation[occupation.id]}
                    value={month.byOccupation[occupation.id]}
                    onCellClick={onCellClick}
                />
            ))}
            <td className="px-4 py-2 text-lg font-bold">
                {school.months.reduce((sum, month) => sum + (month.byOccupation[occupation.id] || 0), 0)}
            </td>
        </tr>
    );
});

// Memoizovana ćelija
const TableCell = memo(({ 
    students, 
    value, 
    onCellClick 
}: { 
    students: Student[]; 
    value: number; 
    onCellClick: (students: Student[]) => void; 
}) => {
    const handleClick = useCallback(() => {
        if (students && students.length > 0) {
            onCellClick(students);
        }
    }, [students, onCellClick]);

    return (
        <td 
            onClick={handleClick}
            className={`px-4 py-2 text-lg font-bold ${
                students && students.length > 0 
                    ? 'cursor-pointer hover:bg-gray-50 transition-colors' 
                    : ''
            }`}
        >
            {value || <DismissCircleColor />}
        </td>
    );
});

// Memoizovani red za ukupno
const TotalRow = memo(({ school }: { school: SchoolEnrollmentData }) => {
    return (
        <tr className="bg-gray-50 font-bold">
            <td className="px-4 py-2">Ukupno u mesecu</td>
            {school.months.map((month, monthIndex) => (
                <td 
                    key={`month-total-${school.schoolId}-${month.month}-${monthIndex}`} 
                    className="px-4 py-2 text-lg font-bold"
                >
                    {month.total || <DismissCircleColor />}
                </td>
            ))}
            <td className="px-4 py-2 text-lg font-bold">
                {school.months.reduce((sum, month) => sum + month.total, 0)}
            </td>
        </tr>
    );
});

export default function SchoolEnrollmentStats() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<SchoolEnrollmentData[]>([]);
    const [availableYears, setAvailableYears] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

    const yearOptions = availableYears.map(year => ({
        value: year,
        label: year.toString()
    }));

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/statistics/monthly-enrollment-aggregated?year=${selectedYear}`);
                setData(data.schools);
                setAvailableYears(data.availableYears);
            } catch (error) {
                console.error('Greška pri učitavanju:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedYear]);

    // Memoizovana funkcija za klik
    const handleCellClick = useCallback((students: Student[]) => {
        console.log(students);
        
        setSelectedStudents(students);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setSelectedStudents([]);
    }, []);

    const handleYearChange = useCallback((option: any) => {
        setSelectedYear(option?.value || new Date().getFullYear());
    }, []);

    if (loading) {
        return <div>Učitavanje...</div>;
    }

    return (
        <div className="w-full shadow space-y-6 p-4">
            <h1 className="!text-3xl font-bold mb-4">Mesečni upis po školama i smerovima</h1>

            <div className="mb-4 w-64">
                <Select
                    options={yearOptions}
                    value={{ value: selectedYear, label: selectedYear.toString() }}
                    onChange={handleYearChange}
                    placeholder="Izaberite godinu"
                />
            </div>

            {data.map((school, schoolIndex) => (
                <SchoolTable 
                    key={`school-${school.schoolId}-${schoolIndex}`}
                    school={school}
                    onCellClick={handleCellClick}
                />
            ))}
            
            <Modal isOpen={isOpen} onClose={closeModal} title={'Lista studenata'}>
                <Suspense fallback={<Spinner />}>
                    <div className="max-h-96 overflow-y-auto">
                        {selectedStudents.length > 0 ? (
                            <ul className="space-y-2">
                                {selectedStudents.map((student) => (
                                    <li key={student.id} className="p-2 border-b">
                                        {student.ime} {student.prezime}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">Nema podataka o studentima</p>
                        )}
                    </div>
                </Suspense>
            </Modal>
        </div>
    );
}