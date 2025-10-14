import {useEffect, useState} from "react";
import Select from "react-select";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import api from "../api";
import {Button} from "@fluentui/react-components";
import {Dismiss24Regular,ChevronRight24Regular,ChevronLeft24Regular,Search24Regular} from "@fluentui/react-icons";
import SchoolEnrollmentStats from "../components/ui/SchoolEnrollmentStats";
import {ManagersSalary} from "../components/ui/ManagersSalary";
import {MyInput} from "../components/ui/MyInput";

interface ManagerStats {
    managerId: number;
    managerName: string;
    studentCount: number;
    totalRevenue: number;
    stats: {
        yearly: { [year: string]: number };
        monthly?: { [monthKey: string]: number };
    };
}

interface Option {
    id: number;
    label: string;
    value: string;
}

const optionsMy: Option[] = [
    { id: 1, value: "all", label: "Sve vreme" },
    { id: 2, value: "year", label: "Godišnje" },
    { id: 3, value: "month", label: "Mesečno" },
];

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Home() {
    const [timeRange, setTimeRange] = useState<Option | null>(optionsMy[0]);
    const [selectedYear, setSelectedYear] = useState<Option | null>(null);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<ManagerStats[]>([]);
    const [availableYears, setAvailableYears] = useState<Option[]>([]);
    const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
    const [showMonthlyStats, setShowMonthlyStats] = useState(false);




    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");



    useEffect(() => {
        setCurrentPage(1);
    }, [timeRange, selectedYear, debouncedSearchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleTimeRangeChange = (selectedOption: Option | null) => {
        setTimeRange(selectedOption);
    };
    const fetchManagerStats = async () => {
        setLoading(true);
        try {
            let url = '/menadzeri';
            const params = new URLSearchParams();

            if (timeRange?.value) {
                params.append('range', timeRange.value);
            }

            if (debouncedSearchTerm) {
                params.append('search', debouncedSearchTerm);
            }

            if (selectedYear?.value) {
                params.append('year', selectedYear.value);
            }

            params.append('page', currentPage.toString());
            params.append('limit', '10');

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const { data } = await api(url);
            setStats(data.managers || data);
            setPagination(data.pagination);

            // Ažuriraj dostupne godine
            if (data.availableYears) {
                const yearOptions = data.availableYears.map((year: number) => ({
                    id: year,
                    value: year.toString(),
                    label: `Godina ${year}`
                }));
                setAvailableYears(yearOptions);
            }
        } catch (error) {
            console.error("Greška pri učitavanju:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchManagerStats();
    }, [timeRange, selectedYear,currentPage,debouncedSearchTerm]);

    const handleSelectedYear = (selectedYear: Option | null) => {
        setSelectedYear(selectedYear);
    }


    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

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

    console.log(pagination);
    const clearAllFilters = () => {
        setSelectedYear(null);
        setTimeRange(optionsMy[0]);
    }

    // Priprema podataka za mesečni prikaz
    const prepareMonthlyData = () => {
        if (!stats.length || !stats[0].stats.monthly) return [];

        const monthlyData: { month: string; [manager: string]: number }[] = [];
        const monthKeys = Object.keys(stats[0].stats.monthly).sort();

        monthKeys.forEach(monthKey => {
            const monthData: any = { month: monthKey };
            stats.forEach(manager => {
                monthData[manager.managerName] = manager.stats.monthly?.[monthKey] || 0;
            });
            monthlyData.push(monthData);
        });

        return monthlyData;
    };

    const monthlyData = prepareMonthlyData();

    return (
        <div className='w-full'>
            <div className="p-4 space-y-6">
                <h1 className="!text-3xl font-bold">Statistika menadžera</h1>

                {/* Filters and Search */}
                <div className="flex gap-3 items-center flex-wrap">

                    <div className="w-64">
                        <Select
                            options={availableYears}
                            onChange={handleSelectedYear}
                            value={selectedYear}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            isSearchable={false}
                            placeholder="Izaberite godinu..."
                        />
                    </div>
                    <div className="w-64">
                        <MyInput
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Pretraži menadžere..."
                            contentBefore={<Search24Regular />}
                        />
                    </div>

                    <Button
                        onClick={clearAllFilters}
                        icon={<Dismiss24Regular />}
                        appearance="subtle"
                    >
                        Poništi filtere
                    </Button>

                    <div className="flex gap-2">
                        <Button
                            appearance={chartType === "bar" ? "primary" : "secondary"}
                            onClick={() => setChartType("bar")}
                        >
                            Stubičasti
                        </Button>
                        <Button
                            appearance={chartType === "line" ? "primary" : "secondary"}
                            onClick={() => setChartType("line")}
                        >
                            Linijski
                        </Button>
                        <Button
                            appearance={showMonthlyStats ? "primary" : "secondary"}
                            onClick={() => setShowMonthlyStats(!showMonthlyStats)}
                            disabled={!stats.length || !stats[0].stats.monthly}
                        >
                            Mesečni prikaz
                        </Button>
                    </div>
                </div>

                {/* Pagination Info */}
                {pagination && (
                    <div className="flex justify-between items-center text-sm text-gray-600">
                        <div>
                            Prikazano {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} od {pagination.totalItems} rezultata
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {showMonthlyStats && monthlyData.length > 0 ? (
                            // Mesečni prikaz
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h2 className="text-xl font-semibold mb-4">Mesečni prikaz broja studenata po menadžerima</h2>
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        {chartType === "bar" ? (
                                            <BarChart data={monthlyData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                {stats.map((manager, index) => (
                                                    <Bar
                                                        key={`bar-${manager.managerId}-${index}`}  // ← Kombinuj ID i index
                                                        dataKey={manager.managerName}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </BarChart>
                                        ) : (
                                            <LineChart data={monthlyData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                {stats.map((manager, index) => (
                                                    <Line
                                                        key={`bar-${manager.managerId}-${index}`}  // ← Kombinuj ID i index
                                                        type="monotone"
                                                        dataKey={manager.managerName}
                                                        stroke={COLORS[index % COLORS.length]}
                                                        activeDot={{ r: 8 }}
                                                    />
                                                ))}
                                            </LineChart>
                                        )}
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ) : (
                            // Standardni prikaz po menadžerima
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h2 className="text-xl font-semibold mb-4">Broj studenata po menadžerima</h2>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            {chartType === "bar" ? (
                                                <BarChart data={stats}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="managerName" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="studentCount" fill="#3182CE" name="Broj studenata" />
                                                </BarChart>
                                            ) : chartType === "line" ? (
                                                <LineChart data={stats}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="managerName" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="studentCount" stroke="#3182CE" activeDot={{ r: 8 }} name="Broj studenata" />
                                                </LineChart>
                                            ) : (
                                                <PieChart>
                                                    <Pie
                                                        data={stats}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ managerName, studentCount }) => `${managerName}: ${studentCount}`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="studentCount"
                                                        nameKey="managerName"
                                                    >
                                                        {stats.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            )}
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h2 className="text-xl font-semibold mb-4">Prihodi po menadžerima</h2>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            {chartType === "bar" ? (
                                                <BarChart data={stats}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="managerName" />
                                                    <YAxis />
                                                    <Tooltip formatter={(value) => [`${value}`, "Prihod"]} />
                                                    <Legend />
                                                    <Bar dataKey="totalRevenue" fill="#00C49F" name="Prihod (EURO)" />
                                                </BarChart>
                                            ) : chartType === "line" ? (
                                                <LineChart data={stats}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="managerName" />
                                                    <YAxis />
                                                    <Tooltip formatter={(value) => [`${value}`, "Prihod"]} />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="totalRevenue" stroke="#00C49F" activeDot={{ r: 8 }} name="Prihod (EURO)" />
                                                </LineChart>
                                            ) : (
                                                <PieChart>
                                                    <Pie
                                                        data={stats}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ managerName, totalRevenue }) => `${managerName}: ${totalRevenue}€`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="totalRevenue"
                                                        nameKey="managerName"
                                                    >
                                                        {stats.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value) => [`${value}€`, "Prihod"]} />
                                                    <Legend />
                                                </PieChart>
                                            )}
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tabelarni prikaz podataka */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Detaljna statistika</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menadžer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Broj studenata</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ukupan prihod</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Godišnja statistika</th>
                                        {stats[0]?.stats.monthly && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mesečna statistika</th>
                                        )}
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {stats.map((manager,index) => (
                                        <tr key={`manager-row-${manager.managerId}-${index}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">{manager.managerName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{manager.studentCount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Intl.NumberFormat('de-DE', {
                                                    style: 'currency',
                                                    currency: 'EUR',
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0
                                                }).format(manager.totalRevenue)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {Object.entries(manager.stats.yearly).map(([year, count]) => (
                                                    <div key={year}>{year}: {count} studenata</div>
                                                ))}
                                            </td>
                                            {manager.stats.monthly && (
                                                <td className="px-6 py-4">
                                                    {Object.entries(manager.stats.monthly).map(([month, count]) => (
                                                        <div key={month}>{month}: {count} studenata</div>
                                                    ))}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2">
                                <Button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={!pagination.hasPreviousPage}
                                    icon={<ChevronLeft24Regular />}
                                    appearance="subtle"
                                >
                                    Prethodna
                                </Button>

                                {getPageNumbers().map((pageNumber) => (
                                    <Button
                                        key={`page-btn-${pageNumber}`}
                                        onClick={() => handlePageChange(pageNumber)}
                                        appearance={pageNumber === pagination.currentPage ? "primary" : "secondary"}
                                    >
                                        {pageNumber}
                                    </Button>
                                ))}

                                <Button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={!pagination.hasNextPage}
                                    iconPosition="after"
                                    icon={<ChevronRight24Regular />}
                                    appearance="subtle"
                                >
                                    Sledeća
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className='zarada-menadzera'>
                <ManagersSalary></ManagersSalary>
            </div>
            <div className='skola-ucenici-block'>
                <SchoolEnrollmentStats></SchoolEnrollmentStats>
            </div>
        </div>
    );
}