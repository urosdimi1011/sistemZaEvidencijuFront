import {useCallback, useEffect, useState} from 'react';
import Select from 'react-select';
import api from '../api';
import {Button} from "@fluentui/react-components";
import {
    TableBody,
    TableCell,
    TableRow,
    Table,
    TableHeader,
    TableHeaderCell,
} from "@fluentui/react-components";
import {formatDate} from "../utils/formatDate";
import {Dismiss24Regular, FilterFilled, Search24Regular,Table24Regular} from "@fluentui/react-icons/lib/fonts";
import {MyInput} from "../components/ui/MyInput";

interface ExpectedPayment {
    month: string;
    monthName: string;
    totalExpected: number;
    totalPaid: number;
    totalRemaining: number;
    bySchool: {
        [key: string]: {
            name: string;
            expected: number;
            paid: number;
            remaining: number;
        };
    };
    byOccupation: {
        [key: string]: {
            name: string;
            expected: number;
            paid: number;
            remaining: number;
        };
    };
    byManager: {
        [key: string]: {
            name: string;
            expected: number;
            paid: number;
            remaining: number;
        };
    };
}

interface PaymentDetail {
    studentId: number;
    studentName: string;
    school: string;
    occupation: string;
    manager: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    paymentStatus: string;
    createdAt: string;
}

interface DetailsResponse {
    data: PaymentDetail[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

interface OptionsForExcepted {
    value: string | null;
    label: string;
}

export default function ExpectedPayments() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ExpectedPayment[]>([]);
    const [detailsResponse, setDetailsResponse] = useState<DetailsResponse | null>(null);
    const [view, setView] = useState<'summary' | 'details'>('summary');
    const [selectedExcepted, setSelectedExcepted] = useState<OptionsForExcepted | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [studentNameSearch, setStudentNameSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearchTerm] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchData();
    }, [selectedYear, selectedMonth, view, currentPage, itemsPerPage, debouncedSearch, selectedExcepted]);

    const onPageChange = useCallback((newPage: number) => {
        setCurrentPage(newPage)
    }, [currentPage])

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedMonth, selectedExcepted, searchTerm]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (view === 'summary') {
                const response = await api.get(`/statistics/expected-payments?year=${selectedYear}`);
                setData(response.data);
            } else {
                let url = `/statistics/expected-payments-details?year=${selectedYear}&page=${currentPage}&limit=${itemsPerPage}`;
                if (selectedMonth) {
                    url += `&month=${selectedMonth}`;
                }
                if (searchTerm.trim()) {
                    url += `&studentName=${encodeURIComponent(searchTerm.trim())}`;
                }
                if (selectedExcepted?.value) {
                    url += `&status=${encodeURIComponent(selectedExcepted.value)}`;
                }
                const response = await api.get(url);
                setDetailsResponse(response.data);
            }
        } catch (error) {
            console.error('Greška pri učitavanju:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = () => {
        setSearchTerm(studentNameSearch);
        setCurrentPage(1);
    };


    const clearFilters = () => {
        setStudentNameSearch('');
        setSearchTerm('');
        setSelectedExcepted(null);
        setSelectedMonth(null);
        setCurrentPage(1);
    };

    const yearOptions = [];
    for (let year = 2020; year <= new Date().getFullYear(); year++) {
        yearOptions.push({ value: year, label: year.toString() });
    }

    const monthOptions = [
        { value: '01', label: 'Januar' },
        { value: '02', label: 'Februar' },
        { value: '03', label: 'Mart' },
        { value: '04', label: 'April' },
        { value: '05', label: 'Maj' },
        { value: '06', label: 'Jun' },
        { value: '07', label: 'Jul' },
        { value: '08', label: 'Avgust' },
        { value: '09', label: 'Septembar' },
        { value: '10', label: 'Oktobar' },
        { value: '11', label: 'Novembar' },
        { value: '12', label: 'Decembar' },
    ];

    const statusOptions = [
        { value: null, label: 'Svi statusi' },
        { value: 'Plaćeno', label: 'Plaćeno' },
        { value: 'Nije plaćeno', label: 'Nije plaćeno' },
        { value: 'Delimično', label: 'Delimično' }
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    if (loading) {
        return <div>Učitavanje...</div>;
    }

    const PaginationControls = () => (
        <div className="flex items-center justify-between bg-white px-6 py-4 border-t">
            <div className="text-sm text-gray-700">
                Stranica {detailsResponse.pagination.currentPage} od {detailsResponse.pagination.totalPages}
                (ukupno {detailsResponse.pagination.totalItems} učenika)
            </div>

            <div className="flex items-center gap-2">
                <Button
                    disabled={!detailsResponse.pagination.hasPreviousPage || loading}
                    onClick={() => onPageChange(1)}
                    size="small"
                    appearance="subtle"
                >
                    Prva
                </Button>
                <Button
                    disabled={!detailsResponse.pagination.hasPreviousPage || loading}
                    onClick={() => onPageChange(detailsResponse.pagination.currentPage - 1)}
                    size="small"
                    appearance="subtle"
                >
                    Prethodna
                </Button>

                {Array.from({ length: Math.min(5, detailsResponse.pagination.totalPages) }, (_, i) => {
                    const startPage = Math.max(1, detailsResponse.pagination.currentPage - 2);
                    const pageNumber = startPage + i;
                    if (pageNumber > detailsResponse.pagination.totalPages) return null;

                    return (
                        <Button
                            key={pageNumber}
                            disabled={loading}
                            onClick={() => onPageChange(pageNumber)}
                            size="small"
                            appearance={pageNumber === detailsResponse.pagination.currentPage ? "primary" : "subtle"}
                        >
                            {pageNumber}
                        </Button>
                    );
                })}

                <Button
                    disabled={!detailsResponse.pagination.hasNextPage || loading}
                    onClick={() => onPageChange(detailsResponse.pagination.currentPage + 1)}
                    size="small"
                    appearance="subtle"
                >
                    Sledeća
                </Button>
                <Button
                    disabled={!detailsResponse.pagination.hasNextPage || loading}
                    onClick={() => onPageChange(detailsResponse.pagination.totalPages)}
                    size="small"
                    appearance="subtle"
                >
                    Poslednja
                </Button>
            </div>
        </div>
    )

    return (
        <>
            <h1 className="!text-3xl font-bold mb-4 text-gray-700 text-shadow-2xs">Očekivane uplate</h1>

            <div className='border my-6 mx-10 border-gray-700/20 shadow-sm relative rounded bg-gray-100'>
                <div className='border-b border-r inline-block border-gray-700/20 px-5 shadow-xs'>
                    <h2 className='text-lg font-semibold flex items-center gap-2 text-gray-500'>Filteri <FilterFilled /></h2>
                </div>

                <div className="flex gap-4 mb-6 flex-wrap p-4">
                    <div className="w-64">
                        <Select
                            options={yearOptions}
                            value={{ value: selectedYear, label: selectedYear.toString() }}
                            onChange={(option) => setSelectedYear(option?.value || new Date().getFullYear())}
                            placeholder="Izaberite godinu"
                        />
                    </div>

                    {view === 'details' && (
                        <>
                            <div className="flex gap-4 w-full">
                                <Select
                                    options={[{ value: null, label: 'Svi meseci' }, ...monthOptions]}
                                    value={selectedMonth
                                        ? monthOptions.find(opt => opt.value === selectedMonth)
                                        : { value: null, label: 'Svi meseci' }}
                                    onChange={(option) => setSelectedMonth(option?.value || null)}
                                    placeholder="Izaberite mesec"
                                    className='w-1/6'
                                />
                                <Select
                                    options={statusOptions}
                                    value={selectedExcepted}
                                    onChange={(option) => setSelectedExcepted(option)}
                                    placeholder="Izaberite status"
                                    className='w-1/6'
                                />
                                <div className="flex gap-2 w-1/5">
                                    <MyInput
                                        type="text"
                                        placeholder="Pretražite po imenu ili prezimenu..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        contentBefore={<Search24Regular />}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    onClick={clearFilters}
                                    appearance="subtle"
                                    disabled={loading}
                                    icon={<Dismiss24Regular />}
                                >
                                    Obriši filtere
                                </Button>
                            </div>
                        </>
                    )}

                    <div className="flex gap-2">
                        <Button
                            appearance={view === 'summary' ? 'primary' : 'secondary'}
                            onClick={() => setView('summary')}
                            className={`px-4 py-2 rounded ${
                                view === 'summary' ? 'bg-blue-500 ' : 'bg-gray-200'
                            }`}
                        >
                            Pregled
                        </Button>
                        <Button
                            appearance={view === 'details' ? 'primary' : 'secondary'}
                            onClick={() => setView('details')}
                            className={'px-4 py-2 rounded'}
                        >
                            Detalji
                        </Button>
                    </div>
                </div>
            </div>

                {view === 'summary' ? (
                    <div className="space-y-6">
                        {data.map(month => (
                            <div key={month.month} className="bg-white p-6 rounded-lg shadow">
                                <h2 className="text-xl font-semibold mb-4">{month.monthName} {selectedYear}</h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-blue-50 p-4 rounded">
                                        <h3 className="font-semibold text-blue-800">Očekivano</h3>
                                        <p className="text-2xl font-bold">{formatCurrency(month.totalExpected)}</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded">
                                        <h3 className="font-semibold text-green-800">Plaćeno</h3>
                                        <p className="text-2xl font-bold">{formatCurrency(month.totalPaid)}</p>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded">
                                        <h3 className="font-semibold text-red-800">Za naplatu</h3>
                                        <p className="text-2xl font-bold">{formatCurrency(month.totalRemaining)}</p>
                                    </div>
                                </div>

                                <h3 className="font-semibold mb-3">Po školama</h3>
                                <div className="overflow-x-auto mb-6">
                                    <table className="min-w-full table-auto">
                                        <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-4 py-2 text-left">Škola</th>
                                            <th className="px-4 py-2 text-left">Očekivano</th>
                                            <th className="px-4 py-2 text-left">Plaćeno</th>
                                            <th className="px-4 py-2 text-left">Za naplatu</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {Object.values(month.bySchool).map((school, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="px-4 py-2">{school.name}</td>
                                                <td className="px-4 py-2">{formatCurrency(school.expected)}</td>
                                                <td className="px-4 py-2">{formatCurrency(school.paid)}</td>
                                                <td className="px-4 py-2">{formatCurrency(school.remaining)}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                <h3 className="font-semibold mb-3">Po menadžerima</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full table-auto">
                                        <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-4 py-2 text-left">Menadžer</th>
                                            <th className="px-4 py-2 text-left">Očekivano</th>
                                            <th className="px-4 py-2 text-left">Plaćeno</th>
                                            <th className="px-4 py-2 text-left">Za naplatu</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {Object.values(month.byManager).map((manager, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="px-4 py-2">{manager.name}</td>
                                                <td className="px-4 py-2">{formatCurrency(manager.expected)}</td>
                                                <td className="px-4 py-2">{formatCurrency(manager.paid)}</td>
                                                <td className="px-4 py-2">{formatCurrency(manager.remaining)}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Detalji očekivanih uplata</h2>

                        {detailsResponse && (
                            <div className="ml-10 mb-4">
                                <h3 className="flex items-center gap-2 !text-md font-semibold">
                                    <Table24Regular /> Ukupan broj stavki: <span className="font-bold">{detailsResponse.pagination.totalItems}</span>
                                </h3>
                                {(searchTerm || selectedExcepted?.value) && (
                                    <p className="text-sm text-blue-600">
                                        Aktivni filteri:
                                        {searchTerm && ` Ime: "${searchTerm}"`}
                                        {selectedExcepted?.value && ` Status: "${selectedExcepted.label}"`}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <Table noNativeElements aria-label="Tabela detalja očekivanih uplata">
                                <TableHeader>
                                    <TableRow>
                                        <TableHeaderCell className="!font-semibold text-shadow-xs">Student</TableHeaderCell>
                                        <TableHeaderCell className="!font-semibold text-shadow-xs">Škola</TableHeaderCell>
                                        <TableHeaderCell className="!font-semibold text-shadow-xs">Smer</TableHeaderCell>
                                        <TableHeaderCell className="!font-semibold text-shadow-xs">Menadžer</TableHeaderCell>
                                        <TableHeaderCell className="!font-semibold text-shadow-xs">Ukupan iznos</TableHeaderCell>
                                        <TableHeaderCell className="!font-semibold text-shadow-xs">Plaćeno</TableHeaderCell>
                                        <TableHeaderCell className="!font-semibold text-shadow-xs">Za naplatu</TableHeaderCell>
                                        <TableHeaderCell className="!font-semibold text-shadow-xs">Status</TableHeaderCell>
                                        <TableHeaderCell className="!font-semibold text-shadow-xs">Datum upisa</TableHeaderCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {detailsResponse?.data.map(detail => (
                                        <TableRow key={detail.studentId}>
                                            <TableCell>{detail.studentName}</TableCell>
                                            <TableCell>{detail.school}</TableCell>
                                            <TableCell>{detail.occupation}</TableCell>
                                            <TableCell>{detail.manager}</TableCell>
                                            <TableCell>{formatCurrency(detail.totalAmount)}</TableCell>
                                            <TableCell>{formatCurrency(detail.paidAmount)}</TableCell>
                                            <TableCell>{formatCurrency(detail.remainingAmount)}</TableCell>
                                            <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                detail.paymentStatus === 'Plaćeno' ? 'bg-green-100 text-green-800' :
                                                    detail.paymentStatus === 'Nije plaćeno' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {detail.paymentStatus}
                                            </span>
                                            </TableCell>
                                            <TableCell>{formatDate(detail.createdAt)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {(detailsResponse && detailsResponse.pagination.totalPages > 1) && <PaginationControls />}

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
                    </div>
                )}
        </>
    );
}