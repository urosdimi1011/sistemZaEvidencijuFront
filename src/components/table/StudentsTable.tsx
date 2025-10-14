import {
    TableBody,
    TableCell,
    TableRow,
    Table,
    TableHeader,
    TableHeaderCell,
    TableCellLayout,
    Button,
    Select,
    Spinner
} from "@fluentui/react-components";
import {
    EditRegular,
    DeleteRegular,
    ChevronUpRegular,
    ChevronDownRegular
} from "@fluentui/react-icons";
import { formatDate } from "../../utils/formatDate";
import { useMemo } from "react";

const columns = [
    { columnKey: "ime", label: "Ime Učenika", showFor: ['admin', 'school_manager'], sortable: true },
    { columnKey: "imeRoditelja", label: "Ime Roditelja", showFor: ['admin', 'school_manager'], sortable: false },
    { columnKey: "prezime", label: "Prezime Učenika", showFor: ['admin', 'school_manager'], sortable: true },
    { columnKey: "zanimanje", label: "Zanimanje učenika", showFor: ['admin', 'school_manager'], sortable: false },
    { columnKey: "type", label: "Tip učenika", showFor: ['admin', 'school_manager'], sortable: false },
    { columnKey: "entry_type", label: "Tip učenika", showFor: ['admin', 'school_manager'], sortable: false },
    { columnKey: "cenaSkolarine", label: "Cena školarine", showFor: ['admin', 'school_manager'], sortable: true },
    { columnKey: "literature", label: "Literatura", showFor: ['admin', 'school_manager'], sortable: false },
    { columnKey: "procenatMenadzeru", label: "Procenat menadžeru", showFor: ['admin'], sortable: false },
    { columnKey: "menadzer", label: "Menadžer za studenta", showFor: ['admin','school_manager'], sortable: false },
    { columnKey: "actions", label: "Akcija", showFor: ['admin'], sortable: false },
    { columnKey: "datumKreiranja", label: "Datum kreiranja", showFor: ['admin', 'school_manager'], sortable: true },
];

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
interface Student {
    "id": number,
    "ime": string,
    "imeRoditelja": string,
    "prezime": string,
    "datumKreiranja": string,
    "type": string,
    "entry_type": string,
    "note": string,
    "literature": boolean,
    "zanimanje": object,
    "cenaSkolarine": number,
    "literatureCost": number,
    "ukupanDug": number,
    "preostaliDug": number,
    "preostaliDugZaMenadzera": number,
    "procenatMenadzeru": number,
    "menadzer": Menadzer,
    "schoolId": number
}
interface Menadzer {
    "id": number,
    "ime": string,
    "prezime": string,
    "datumKreiranja": string,
    "datumIzmene": string
}
interface StudentTableProps {
    studenti: Student[];
    kliknutiRed: (student: any) => void;
    obojeniRedovi: boolean;
    obojeniRedoviZaMenadzere: boolean;
    kliknutoNaDugmeEdit: (student: any) => void;
    kliknutoNaDugmeDelete: (student: any) => void;
    isSchoolManager: boolean;
    isAdmin: boolean;
    pagination: PaginationInfo;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (limit: number) => void;
    onSort: (field: string) => void;
    currentSortBy: string;
    currentSortOrder: 'ASC' | 'DESC';
    loading?: boolean;
}

function StudentTable({
                          studenti,
                          kliknutiRed,
                          obojeniRedovi,
                          obojeniRedoviZaMenadzere,
                          kliknutoNaDugmeEdit,
                          kliknutoNaDugmeDelete,
                          isSchoolManager,
                          isAdmin,
                          pagination,
                          onPageChange,
                          onItemsPerPageChange,
                          onSort,
                          currentSortBy,
                          currentSortOrder,
                          loading = false
                      }: StudentTableProps) {

    const currentRole = isAdmin ? 'admin' : (isSchoolManager ? 'school_manager' : 'korisnik');

    const filteredColumns = columns.filter(column =>
        column.showFor.includes(currentRole)
    );

    const daLiSuObojeniRedovi = (student : Student) => {
        if (obojeniRedovi) return obojeniRedoviZaSkolarinu(student);
        if (obojeniRedoviZaMenadzere) return obojeniRedoviZaMenadzera(student);
        return '';
    };

    const obojeniRedoviZaSkolarinu = (student : Student) => {
        if (student.preostaliDug === 0) return 'bg-green-600 !text-gray-50 hover:!bg-green-600';
        if (student.preostaliDug > 0) return 'bg-red-600 !text-gray-50 hover:!bg-red-600';
    };

    const obojeniRedoviZaMenadzera = (student : Student) => {
        if (student.preostaliDugZaMenadzera === 0) return 'bg-green-600 !text-gray-50 hover:!bg-green-600';
        if (student.preostaliDugZaMenadzera > 0) return 'bg-red-600 !text-gray-50 hover:!bg-red-600';
    };

    const otvoriModalZaEdit = (e, item) => {
        e.stopPropagation();
        kliknutoNaDugmeEdit(item);
    };

    const otvoriModalZaDelete = (e, item) => {
        e.stopPropagation();
        kliknutoNaDugmeDelete(item);
    };

    const handleSort = (columnKey: string) => {
        const column = columns.find(col => col.columnKey === columnKey);
        if (column?.sortable) {
            onSort(columnKey);
        }
    };

    const getSortIcon = (columnKey: string) => {
        if (currentSortBy !== columnKey) return null;
        return currentSortOrder === 'ASC' ? <ChevronUpRegular /> : <ChevronDownRegular />;
    };

    const filteredStudents = useMemo(() => {
        if (isSchoolManager) {
            // Za school_manager - prikaži samo ime, prezime, zanimanje, cenu, datum
            return studenti.map(student => ({
                id: student.id,
                ime: student.ime,
                imeRoditelja: student.imeRoditelja,
                prezime: student.prezime,
                zanimanje: student.zanimanje,
                type: student.type,
                entry_type: student.entry_type,
                literature: student.literature,
                menadzer : student.menadzer,
                cenaSkolarine: student.cenaSkolarine,
                datumKreiranja: student.datumKreiranja,
            }));
        } else if (isAdmin) {
            return studenti;
        }
    }, [studenti, isSchoolManager, isAdmin]);
    const PaginationControls = () => (
        <div className="flex items-center justify-between bg-white px-6 py-4 border-t">

            <div className="text-sm text-gray-700">
                Stranica {pagination.currentPage} od {pagination.totalPages}
                (ukupno {pagination.totalItems} učenika)
            </div>

            <div className="flex items-center gap-2">
                <Button
                    disabled={!pagination.hasPrevPage || loading}
                    onClick={() => onPageChange(1)}
                    size="small"
                    appearance="subtle"
                >
                    Prva
                </Button>
                <Button
                    disabled={!pagination.hasPrevPage || loading}
                    onClick={() => onPageChange(pagination.currentPage - 1)}
                    size="small"
                    appearance="subtle"
                >
                    Prethodna
                </Button>

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
                    Učenici {pagination.totalItems > 0 && `(${pagination.totalItems})`}
                </h3>
                {loading && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 mt-1">
                        <Spinner size="tiny" />
                        <span>Učitava...</span>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-hidden">
                <Table
                    noNativeElements
                    className="w-full"
                >
                    <TableHeader>
                        <TableRow>
                            {filteredColumns.map((column) => (
                                <TableHeaderCell
                                    key={column.columnKey}
                                    className={`!font-semibold text-shadow-xs ${
                                        column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                                    }`}
                                    onClick={() => column.sortable ? handleSort(column.columnKey) : undefined}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{column.label}</span>
                                        {column.sortable && getSortIcon(column.columnKey)}
                                    </div>
                                </TableHeaderCell>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.map((item) => (
                            <TableRow
                                className={`${daLiSuObojeniRedovi(item) || ''} ${
                                    !isAdmin ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-gray-50'
                                } ${loading ? 'opacity-50' : ''}`}
                                onClick={() => !loading && isAdmin ? kliknutiRed(item) : null}
                                key={item.id}
                            >
                                {'ime' in item && (
                                    <TableCell>{item.ime}</TableCell>
                                )}

                                {'imeRoditelja' in item && (
                                    <TableCell>{item.imeRoditelja || '-'}</TableCell>
                                )}

                                {'prezime' in item && (
                                    <TableCell>{item.prezime}</TableCell>
                                )}

                                {'zanimanje' in item && (
                                    <TableCell>{item.zanimanje?.name || '-'}</TableCell>
                                )}

                                {'type' in item && (
                                    <TableCell>{item.type || '-'}</TableCell>
                                )}

                                {'entry_type' in item && (
                                    <TableCell>{item.entry_type || '-'}</TableCell>
                                )}

                                {'cenaSkolarine' in item && (
                                    <TableCell>{item.cenaSkolarine}&euro;</TableCell>
                                )}
                                {'literature' in item && (
                                    <TableCell>{item.literature ? '50€' : 'Nema literaturu'}</TableCell>
                                )}

                                {'procenatMenadzeru' in item && (
                                    <TableCell>
                                        {item.procenatMenadzeru ? item.procenatMenadzeru + '%' : "Nema procenat za menadžera"}
                                    </TableCell>
                                )}

                                {'menadzer' in item && (
                                    <TableCell>
                                        {item.menadzer ? `${item.menadzer.ime} ${item.menadzer.prezime}` : 'Nema menadžera'}
                                    </TableCell>
                                )}

                                {isAdmin && (
                                    <TableCell role="gridcell" tabIndex={0}>
                                        <TableCellLayout>
                                            <Button
                                                className='mr-2'
                                                onClick={(e) => otvoriModalZaEdit(e, item)}
                                                icon={<EditRegular />}
                                                aria-label="Edit"
                                                disabled={loading}
                                            />
                                            <Button
                                                className='ml-2'
                                                onClick={(e) => otvoriModalZaDelete(e, item)}
                                                icon={<DeleteRegular />}
                                                aria-label="Delete"
                                                disabled={loading}
                                            />
                                        </TableCellLayout>
                                    </TableCell>
                                )}

                                {'datumKreiranja' in item && (
                                    <TableCell>{formatDate(item.datumKreiranja)}</TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {filteredStudents.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-500">
                        Nema učenika za prikaz
                    </div>
                )}

                {loading && filteredStudents.length === 0 && (
                    <div className="flex justify-center items-center py-8">
                        <Spinner size="medium" />
                    </div>
                )}
            </div>

            {filteredStudents.length > 0 && <PaginationControls />}
        </div>
    );
}

export default StudentTable;