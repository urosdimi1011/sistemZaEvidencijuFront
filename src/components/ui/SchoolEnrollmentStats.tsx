import { useEffect, useState } from 'react';
import Select from 'react-select';
import api from "../../api";
import {DismissCircleColor} from "@fluentui/react-icons";

interface SchoolEnrollmentData {
    schoolId: number;
    schoolName: string;
    months: {
        month: string;
        monthName: string;
        total: number;
        byOccupation: { [key: string]: number };
    }[];
    occupations: {
        id: number;
        name: string;
    }[];
}

export default function SchoolEnrollmentStats() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<SchoolEnrollmentData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/statistics/monthly-enrollment-aggregated?year=${selectedYear}`);
                setData(response.data);
            } catch (error) {
                console.error('Greška pri učitavanju:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedYear]);

    const yearOptions = [];
    for (let year = 2020; year <= new Date().getFullYear(); year++) {
        yearOptions.push({ value: year, label: year.toString() });
    }

    if (loading) {
        return <div>Učitavanje...</div>;
    }

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-4">Mesečni upis po školama i smerovima</h1>

            <div className="mb-4 w-64">
                <Select
                    options={yearOptions}
                    value={{ value: selectedYear, label: selectedYear.toString() }}
                    onChange={(option) => setSelectedYear(option?.value || new Date().getFullYear())}
                    placeholder="Izaberite godinu"
                />
            </div>

            {data.map(school => (
                <div key={school.schoolId} className="bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-semibold mb-4">{school.schoolName}</h2>

                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left">Smerovi</th>
                                {school.months.map(occ => (
                                    <th key={occ.month} className="px-4 py-2 text-left">{occ.monthName}</th>
                                ))}
                                <th className="px-4 py-2 text-left">Ukupno</th>
                            </tr>
                            </thead>
                            <tbody>
                            {school.occupations.map(schoole => (
                                <tr key={schoole.id} className="border-b">
                                    <td className="px-4 py-2 font-medium text-lg">{schoole.name}</td>
                                    {school.months.map(month => (
                                        <td key={schoole.id} className="px-4 py-2 text-lg font-bold">
                                            {month.byOccupation[schoole.id] || <DismissCircleColor />}
                                        </td>
                                    ))}
                                    {/*<td className="px-4 py-2 font-bold">{schoole}</td>*/}
                                        <td key={schoole.id} className="px-4 py-2 text-lg font-bold">
                                            {school.months.reduce((sum, month) => sum + (month.byOccupation[schoole.id] || 0), 0)}
                                        </td>
                                </tr>
                            ))}
                            <tr className="bg-gray-50 font-bold">
                                <td className="px-4 py-2">Ukupno u mesecu</td>

                                {school.months.map(month => (
                                    <td key={month.month} className="px-4 py-2 text-lg font-bold">
                                        { month.total || <DismissCircleColor />}
                                    </td>
                                ))}
                                <td className="px-4 py-2 text-lg font-bold ">
                                    {school.months.reduce((sum, month) => sum + month.total, 0)}
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}