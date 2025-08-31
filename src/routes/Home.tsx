import {useEffect, useState} from "react";
import Select from "react-select";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import api from "../api";
import {Button} from "@fluentui/react-components";
import {Dismiss24Regular} from "@fluentui/react-icons";
import SchoolEnrollmentStats from "../components/ui/SchoolEnrollmentStats";
import {ManagersSalary} from "../components/ui/ManagersSalary";

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Home() {
    const [timeRange, setTimeRange] = useState<Option | null>(optionsMy[0]);
    const [selectedYear, setSelectedYear] = useState<Option | null>(null);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<ManagerStats[]>([]);
    const [availableYears, setAvailableYears] = useState<Option[]>([]);
    const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
    const [showMonthlyStats, setShowMonthlyStats] = useState(false);

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

            if (selectedYear?.value) {
                params.append('year', selectedYear.value);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const { data } = await api(url);
            setStats(data.managers || data);

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
    }, [timeRange, selectedYear]);

    const handleSelectedYear = (selectedYear: Option | null) => {
        setSelectedYear(selectedYear);
    }

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
                <h1 className="text-2xl font-bold">Statistika menadžera</h1>

                <div className="flex gap-3 items-center flex-wrap">
                    <div className="w-64">
                        <Select
                            options={optionsMy}
                            onChange={handleTimeRangeChange}
                            value={timeRange}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            isSearchable={false}
                            placeholder="Izaberite vremenski opseg..."
                        />
                    </div>
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
                                                        key={manager.managerId}
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
                                                        key={manager.managerId}
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
                                    {stats.map((manager) => (
                                        <tr key={manager.managerId}>
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