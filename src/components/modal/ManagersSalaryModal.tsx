import Modal from "./Modal";
import { useState, useEffect } from "react";
import { formatMoney } from '../../utils/FormatMoney';
import { Pagination } from "../ui/Pagination";
import api from "../../api";
import { Spinner } from "@fluentui/react-components";

interface ManagersSalary{
    data : any;
    menadzer : any;
    pagination : PaginationInfo
}
interface PaginationInfo {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
}
const ManagersSalaryModal = ({ isOpen, managerId, onClose }) => {
    const [data, setData] = useState<ManagersSalary>();
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isOpen && managerId) {
            fetchData();
        }
    }, [isOpen, managerId, page, limit, search]);

    const fetchData = async () => {
        setLoading(true);
        const response = await api.get(`/menadzeri/${managerId}/students/details`, {
            params: { page, limit, search }
        });
        setData(response.data);
        setLoading(false);
    };

       const handleSearch = (term) => {
        setSearch(term);
        setPage(1); 
    };

    if (!data) return null;

    const students = data?.data; 
    const pagination = data?.pagination;
    const menadzer = data?.menadzer;
    const ukupnoPlaceno = data.menadzer?.ukupnoPlaceno;
    const ukupnoPreostalo = menadzer.ukupnaZarada - ukupnoPlaceno;

     const procenatPlacenostiFiltered = menadzer.ukupnaZarada > 0
        ? (ukupnoPlaceno / menadzer.ukupnaZarada) * 100
        : 0;

    return (
        <Modal isOpen={isOpen} title={`Menadžer - ${menadzer.name}`} onClose={onClose}>
            <div className="p-4 border-b">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Pretraži učenike po imenu..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {search && (
                        <button
                            onClick={() => handleSearch('')}
                            className="absolute right-0 top-0 border !border-gray-400 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                 {loading ? (
                    <div className="h-[400px]">
                        <Spinner className="mt-5"></Spinner>
                    </div>
                ) : (
                <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0">
                    <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Učenik</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Škola</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Zanimanje</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Zarada</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Plaćeno</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Preostalo</th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {students && students.length ? 
                    (students.map((ucenik) => {
                        let statusElement;
                        let progressPercentage = ucenik.zarada > 0
                            ? (ucenik.placeniIznos / ucenik.zarada) * 100
                            : 0;

                        switch(ucenik.placeno) {
                            case 'u_punosti_placeno':
                                statusElement = (
                                    <span
                                        className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded cursor-help"
                                        title="Plaćeno u potpunosti"
                                    >
                                            ✅ Potpuno
                                        </span>
                                );
                                break;
                            case 'delimicno_placeno':
                                statusElement = (
                                    <div className="tooltip-container relative inline-block text-center">
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                            <div
                                                className="bg-yellow-500 h-2 rounded-full"
                                                style={{ width: `${progressPercentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-yellow-700">
                                                {progressPercentage.toFixed(0)}%
                                            </span>
                                        <div className="tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 invisible transition-opacity">
                                            Plaćeno: {ucenik.placeniIznos.toFixed(2)}€<br/>
                                            Preostalo: {ucenik.preostalo.toFixed(2)}€
                                        </div>
                                    </div>
                                );
                                break;
                            case 'nije_placeno':
                            default:
                                statusElement = (
                                    <span
                                        className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded cursor-help"
                                        title="Nije plaćeno"
                                    >
                                            ❌ Nije plaćeno
                                        </span>
                                );
                        }

                        return (
                            <tr key={ucenik.idUcenika} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3">{ucenik.imeIPrezimeUcenika}</td>
                                <td className="px-4 py-3">{ucenik.skola}</td>
                                <td className="px-4 py-3">{ucenik.zanimanje}</td>
                                <td className="px-4 py-3 text-right font-medium">
                                    {ucenik.zarada.toFixed(2)}€
                                </td>
                                <td className="px-4 py-3 text-right">
                                        <span className={ucenik.placeniIznos > 0 ? "text-green-600 font-medium" : "text-gray-500"}>
                                            {ucenik.placeniIznos.toFixed(2)}€
                                        </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                        <span className={ucenik.preostalo > 0 ? "text-red-600 font-medium" : "text-gray-500"}>
                                            {ucenik.preostalo.toFixed(2)}€
                                        </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {statusElement}
                                </td>
                            </tr>
                        );
                        
                    })) : (
                        <div className="h-[400px] text-center w-full">
                            <h3 className=" text-2xl">Nema studenata</h3>
                        </div>
                    )
                    }

                    </tbody>
                </table>)}
            </div>

            <div className="p-4 border-t bg-gray-50">
                {/* Paginacija */}
                <div className="my-5">
                    <Pagination {...pagination} goToPage={(page : number)=>setPage(page)}></Pagination>
                </div>
                {/* Statistika */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                        <div className="text-sm text-gray-600">Ukupna zarada:</div>
                        <div className="font-semibold">{formatMoney(menadzer.ukupnaZarada)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Ukupno plaćeno:</div>
                        <div className="font-semibold text-green-600">{formatMoney(ukupnoPlaceno)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Ukupno preostalo:</div>
                        <div className="font-semibold text-red-600">{formatMoney(ukupnoPreostalo)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Procenat plaćenosti:</div>
                        <div className="font-semibold">
                            {procenatPlacenostiFiltered.toFixed(1)}%
                        </div>
                    </div>
                </div>

            </div>

        </Modal>
    );
};

export default ManagersSalaryModal;