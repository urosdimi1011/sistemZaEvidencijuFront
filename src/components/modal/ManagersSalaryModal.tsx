import Modal from "./Modal";
import { useState, useEffect } from "react";
import { formatMoney } from '../../utils/FormatMoney';

const ManagersSalaryModal = ({ isOpen,selectedManager, onClose }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    console.log("IsOpen",isOpen);

    // Resetuj paginaciju kada se promeni selectedManager ili search term
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedManager, searchTerm]);

    if (!selectedManager) return null;

    // Filtriranje
    const filteredUcenici = selectedManager.zaradaPoUceniku.filter(ucenik =>
        ucenik.imeIPrezimeUcenika.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Paginacija
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUcenici.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUcenici.length / itemsPerPage);

    const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
    const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

    // Ukupna statistika za filtrirane učenike
    const ukupnaZaradaFiltered = filteredUcenici.reduce((sum, ucenik) => sum + ucenik.zarada, 0);
    const ukupnoPlacenoFiltered = filteredUcenici.reduce((sum, ucenik) => sum + ucenik.placeniIznos, 0);
    const ukupnoPreostaloFiltered = ukupnaZaradaFiltered - ukupnoPlacenoFiltered;
    const procenatPlacenostiFiltered = ukupnaZaradaFiltered > 0
        ? (ukupnoPlacenoFiltered / ukupnaZaradaFiltered) * 100
        : 0;

    return (
        <Modal isOpen={isOpen} title={`Učenici - ${selectedManager.name}`} onClose={onClose}>
            <div className="p-4 border-b">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Pretraži učenike po imenu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    )}
                </div>
                {searchTerm && (
                    <div className="text-sm text-gray-600 mt-2">
                        Pronađeno {filteredUcenici.length} od {selectedManager.zaradaPoUceniku.length} učenika
                    </div>
                )}
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0">
                    <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Učenik</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Zarada</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Plaćeno</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Preostalo</th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentItems.map((ucenik) => {
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
                    })}
                    </tbody>
                </table>

                {currentItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        {searchTerm ? 'Nema učenika koji odgovaraju pretrazi' : 'Nema podataka o učenícima'}
                    </div>
                )}
            </div>

            <div className="p-4 border-t bg-gray-50">
                {/* Paginacija */}
                {filteredUcenici.length > 0 && (
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-sm text-gray-600">
                            Prikaz {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUcenici.length)} od {filteredUcenici.length} učenika
                        </div>

                        <div className="flex items-center space-x-2">
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="border rounded px-2 py-1 text-sm"
                            >
                                {[5, 10, 20, 50].map(size => (
                                    <option key={size} value={size}>{size} po strani</option>
                                ))}
                            </select>

                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ←
                            </button>
                            <span className="text-sm">
                                Strana {currentPage} od {totalPages}
                            </span>
                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                →
                            </button>
                        </div>
                    </div>
                )}

                {/* Statistika */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                        <div className="text-sm text-gray-600">Ukupna zarada:</div>
                        <div className="font-semibold">{formatMoney(ukupnaZaradaFiltered)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Ukupno plaćeno:</div>
                        <div className="font-semibold text-green-600">{formatMoney(ukupnoPlacenoFiltered)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Ukupno preostalo:</div>
                        <div className="font-semibold text-red-600">{formatMoney(ukupnoPreostaloFiltered)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Procenat plaćenosti:</div>
                        <div className="font-semibold">
                            {procenatPlacenostiFiltered.toFixed(1)}%
                        </div>
                    </div>
                </div>

                <div className="text-xs text-gray-500">
                    Ukupno: {filteredUcenici.length} učenika
                    {searchTerm && ` (filtrirano od ${selectedManager.zaradaPoUceniku.length})`}
                </div>
            </div>

        </Modal>
    );
};

export default ManagersSalaryModal;