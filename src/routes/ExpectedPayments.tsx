import { useEffect, useState } from 'react';
import Select from 'react-select';
import api from '../api';

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

export default function ExpectedPayments() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ExpectedPayment[]>([]);
    const [details, setDetails] = useState<PaymentDetail[]>([]);
    const [view, setView] = useState<'summary' | 'details'>('summary');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (view === 'summary') {
                    const response = await api.get(`/statistics/expected-payments?year=${selectedYear}`);
                    setData(response.data);
                } else {
                    const url = selectedMonth
                        ? `/statistics/expected-payments-details?year=${selectedYear}&month=${selectedMonth}`
                        : `/statistics/expected-payments-details?year=${selectedYear}`;
                    const response = await api.get(url);
                    setDetails(response.data);
                }
            } catch (error) {
                console.error('Greška pri učitavanju:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedYear, selectedMonth, view]);

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

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Očekivane uplate</h1>

            <div className="flex gap-4 mb-6 flex-wrap">
                <div className="w-64">
                    <Select
                        options={yearOptions}
                        value={{ value: selectedYear, label: selectedYear.toString() }}
                        onChange={(option) => setSelectedYear(option?.value || new Date().getFullYear())}
                        placeholder="Izaberite godinu"
                    />
                </div>

                {view === 'details' && (
                    <div className="w-64">
                        <Select
                            options={[{ value: null, label: 'Svi meseci' }, ...monthOptions]}
                            value={selectedMonth
                                ? monthOptions.find(opt => opt.value === selectedMonth)
                                : { value: null, label: 'Svi meseci' }}
                            onChange={(option) => setSelectedMonth(option?.value || null)}
                            placeholder="Izaberite mesec"
                        />
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={() => setView('summary')}
                        className={`px-4 py-2 rounded ${
                            view === 'summary' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        }`}
                    >
                        Pregled
                    </button>
                    <button
                        onClick={() => setView('details')}
                        className={`px-4 py-2 rounded ${
                            view === 'details' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        }`}
                    >
                        Detalji
                    </button>
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

                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left">Student</th>
                                <th className="px-4 py-2 text-left">Škola</th>
                                <th className="px-4 py-2 text-left">Smer</th>
                                <th className="px-4 py-2 text-left">Menadžer</th>
                                <th className="px-4 py-2 text-left">Ukupan iznos</th>
                                <th className="px-4 py-2 text-left">Plaćeno</th>
                                <th className="px-4 py-2 text-left">Za naplatu</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Datum upisa</th>
                            </tr>
                            </thead>
                            <tbody>
                            {details.map(detail => (
                                <tr key={detail.studentId} className="border-b">
                                    <td className="px-4 py-2">{detail.studentName}</td>
                                    <td className="px-4 py-2">{detail.school}</td>
                                    <td className="px-4 py-2">{detail.occupation}</td>
                                    <td className="px-4 py-2">{detail.manager}</td>
                                    <td className="px-4 py-2">{formatCurrency(detail.totalAmount)}</td>
                                    <td className="px-4 py-2">{formatCurrency(detail.paidAmount)}</td>
                                    <td className="px-4 py-2">{formatCurrency(detail.remainingAmount)}</td>
                                    <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                detail.paymentStatus === 'Plaćeno' ? 'bg-green-100 text-green-800' :
                                                    detail.paymentStatus === 'Nije plaćeno' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {detail.paymentStatus}
                                            </span>
                                    </td>
                                    <td className="px-4 py-2">{new Date(detail.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}