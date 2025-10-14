import {
    TableBody,
    TableCell,
    TableRow,
    Table,
    TableHeader,
    TableHeaderCell,
    TableCellLayout,
    Button, Spinner,
} from "@fluentui/react-components";
import { formatDate } from "../../utils/formatDate";
import {
    EditRegular,
    DeleteRegular, ChevronLeft24Regular, ChevronRight24Regular
} from "@fluentui/react-icons";
import { usePagination } from "../../utils/usePagination";
import {useState} from "react";

const columns = [
    { columnKey: "ime", label: "Ime Menadzera" },
    { columnKey: "prezime", label: "Prezime Menadzera" },
    { columnKey: "datumKreiranja", label: "Datum kreiranja" },
    { columnKey: "datumIzmene", label: "Datum izmene" },
    { columnKey: "studentsCount", label: "Broj studenata" },
    { columnKey: "actions", label: "Akcija" },
];
interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
function MenadzerTable({ menadzeri, kliknutoNaDugmeDelete, kliknutoNaDugmeEdit,pagination,
                           onPageChange, kliknutiRed, loading = false }) {
    //
    // const [currentPage, setCurrentPage] = useState(1);
    // const [pagination, setPagination] = useState<PaginationInfo | null>(null);

    const otvoriModalZaDelete = (e, item) => {
        e.stopPropagation();
        kliknutoNaDugmeDelete(item);
    }

    const otvoriModalZaEdit = (e, item) => {
        e.stopPropagation();
        kliknutoNaDugmeEdit(item);
    }

    const PaginationControls = () => (
        <div className="flex items-center justify-between bg-white px-6 py-4 border-t">
            {/* Items per page selector

            {/* Page info */}
            <div className="text-sm text-gray-700">
                Stranica {pagination.currentPage} od {pagination.totalPages}
                (ukupno {pagination.totalItems} menadžera)
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
                <Button
                    disabled={!pagination.hasPreviousPage || loading}
                    onClick={() => onPageChange(1)}
                    size="small"
                    appearance="subtle"
                >
                    Prva
                </Button>
                <Button
                    disabled={!pagination.hasPreviousPage || loading}
                    onClick={() => onPageChange(pagination.currentPage - 1)}
                    size="small"
                    appearance="subtle"
                >
                    Prethodna
                </Button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const startPage = Math.max(1, pagination.currentPage - 2);
                    const pageNumber = startPage + i;
                    if (pageNumber > pagination.totalPages) return null;

                    return (
                        <Button
                            key={pageNumber}
                            disabled={loading}
                            onClick={() => onPageChange(pageNumber)}
                            size="small"
                            appearance={pageNumber === pagination.currentPage ? "primary" : "subtle"}
                        >
                            {pageNumber}
                        </Button>
                    );
                })}

                <Button
                    disabled={!pagination.hasNextPage || loading}
                    onClick={() => onPageChange(pagination.currentPage + 1)}
                    size="small"
                    appearance="subtle"
                >
                    Sledeća
                </Button>
                <Button
                    disabled={!pagination.hasNextPage || loading}
                    onClick={() => onPageChange(pagination.totalPages)}
                    size="small"
                    appearance="subtle"
                >
                    Poslednja
                </Button>
            </div>
        </div>
    );

    return (
        <div className='flex flex-col bg-white rounded-lg shadow'>
            <div className='px-6 py-4 border-b bg-gray-50'>
                <h3 className='text-lg font-semibold text-gray-800'>
                    Menadžeri
                </h3>
            </div>

            <div className="flex-1 overflow-hidden">
                <Table
                    noNativeElements
                    aria-label="Table without semantic HTML elements"
                    className="w-full"

                >
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHeaderCell key={column.columnKey} className='!font-semibold text-shadow-xs'>
                                    {column.label}
                                </TableHeaderCell>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {menadzeri.map((item) => (
                            <TableRow onClick={() => kliknutiRed(item)} key={item.id}>
                                <TableCell>
                                    {item.ime}
                                </TableCell>
                                <TableCell>
                                    {item.prezime}
                                </TableCell>
                                <TableCell>
                                    {formatDate(item.datumKreiranja)}
                                </TableCell>
                                <TableCell>
                                    {formatDate(item.datumIzmene)}
                                </TableCell>
                                <TableCell>
                                    {item.studentsCount}
                                </TableCell>
                                <TableCell role="gridcell" tabIndex={0}>
                                    <TableCellLayout>
                                        <Button onClick={(e) => otvoriModalZaEdit(e, item)} icon={<EditRegular />} aria-label="Edit" />
                                        <Button onClick={(e) => otvoriModalZaDelete(e, item)} icon={<DeleteRegular />} aria-label="Delete" />
                                    </TableCellLayout>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {menadzeri.length > 0 && <PaginationControls />}

        </div>
    );
}

export default MenadzerTable;