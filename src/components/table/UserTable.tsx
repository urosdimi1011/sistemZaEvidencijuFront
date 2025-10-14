import {
    TableBody,
    TableCell,
    TableRow,
    Table,
    TableHeader,
    TableHeaderCell,
    TableCellLayout,
    Button,
    Spinner,
    Badge
} from "@fluentui/react-components";
import {
    EditRegular,
    DeleteRegular,
    ChevronUpRegular,
    ChevronDownRegular,
    PersonRegular,
    OrganizationRegular
} from "@fluentui/react-icons";
import { formatDate } from "../../utils/formatDate";
import { useMemo, useState } from "react";

const columns = [
    { columnKey: "email", label: "Email", showFor: ['admin', 'school_manager'], sortable: true },
    { columnKey: "role", label: "Uloga", showFor: ['admin', 'school_manager'], sortable: true },
    { columnKey: "schoolName", label: "Škola", showFor: ['admin'], sortable: true },
    { columnKey: "createdAt", label: "Datum kreiranja", showFor: ['admin'], sortable: true },
    { columnKey: "updatedAt", label: "Poslednja izmena", showFor: ['admin'], sortable: true },
    { columnKey: "actions", label: "Akcije", showFor: ['admin'], sortable: false },
];

interface User {
    id?: number;
    email: string;
    role: 'admin' | 'school_manager' | 'korisnik';
    schoolId?: number | null;
    schoolName?: string | null;
    createdAt: string;
    updatedAt: string;
}

interface School {
    id: number;
    name: string;
}

interface UserTableProps {
    users: User[];
    schools: School[];
    kliknutoNaDugmeEdit: (user: User) => void;
    kliknutoNaDugmeDelete: (user: User) => void;
    kliknutiRed?: (user: User) => void;
    isSchoolManager?: boolean;
    isAdmin?: boolean;
    loading?: boolean;
}

function UserTable({
                       users,
                       schools,
                       kliknutoNaDugmeEdit,
                       kliknutoNaDugmeDelete,
                       kliknutiRed,
                       isSchoolManager = false,
                       isAdmin = true,
                       loading = false
                   }: UserTableProps) {

    const [sortBy, setSortBy] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

    const currentRole = isAdmin ? 'admin' : (isSchoolManager ? 'school_manager' : 'korisnik');

    const filteredColumns = columns.filter(column =>
        column.showFor.includes(currentRole)
    );

    const otvoriModalZaEdit = (e, item) => {
        e.stopPropagation();
        kliknutoNaDugmeEdit(item);
    };

    const otvoriModalZaDelete = (e, item) => {
        e.stopPropagation();
        console.log(item);
        kliknutoNaDugmeDelete(item);
    };

    const handleSort = (columnKey: string) => {
        const column = columns.find(col => col.columnKey === columnKey);
        if (!column?.sortable) return;

        if (sortBy === columnKey) {
            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(columnKey);
            setSortOrder('ASC');
        }
    };

    const getSortIcon = (columnKey: string) => {
        if (sortBy !== columnKey) return null;
        return sortOrder === 'ASC' ? <ChevronUpRegular /> : <ChevronDownRegular />;
    };

    const sortedUsers = useMemo(() => {
        if (!sortBy) return users;

        return [...users].sort((a, b) => {
            let aValue: any = a[sortBy];
            let bValue: any = b[sortBy];

            // Specijalno sortiranje za schoolName
            if (sortBy === 'schoolName') {
                aValue = a.schoolName || 'Bez škole';
                bValue = b.schoolName || 'Bez škole';
            }

            // String sortiranje
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const result = aValue.localeCompare(bValue, 'sr-RS');
                return sortOrder === 'ASC' ? result : -result;
            }

            // Date sortiranje
            if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                const dateA = new Date(aValue).getTime();
                const dateB = new Date(bValue).getTime();
                const result = dateA - dateB;
                return sortOrder === 'ASC' ? result : -result;
            }

            // Default sortiranje
            if (aValue < bValue) return sortOrder === 'ASC' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'ASC' ? 1 : -1;
            return 0;
        });
    }, [users, sortBy, sortOrder]);

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge appearance="filled" color="danger" icon={<PersonRegular />}>Admin</Badge>;
            case 'school_manager':
                return <Badge appearance="filled" color="brand" icon={<OrganizationRegular />}>Menadžer</Badge>;
            case 'korisnik':
                return <Badge appearance="filled" color="subtle" icon={<PersonRegular />}>Korisnik</Badge>;
            default:
                return <Badge appearance="outline">{role}</Badge>;
        }
    };

    const getRoleOrder = (role: string) => {
        // Za sortiranje - admin na vrh, zatim school_manager, pa korisnik
        switch (role) {
            case 'admin': return 1;
            case 'school_manager': return 2;
            case 'korisnik': return 3;
            default: return 4;
        }
    };

    return (
        <div className='flex flex-col bg-white rounded-lg shadow'>
            {/* Header sa statistikama */}
            <div className='px-6 py-4 border-b bg-gray-50'>
                <div className="flex justify-between items-center">
                    <h3 className='text-lg font-semibold text-gray-800'>
                        Korisnici ({users.length})
                    </h3>
                    {loading && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                            <Spinner size="tiny" />
                            <span>Učitava...</span>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="flex gap-6 mt-2 text-sm text-gray-600">
                    <span>Administratori: {users.filter(u => u.role === 'admin').length}</span>
                    <span>Menadžeri: {users.filter(u => u.role === 'school_manager').length}</span>
                    <span>Korisnici: {users.filter(u => u.role === 'korisnik').length}</span>
                </div>
            </div>

            {/* Tabela */}
            <div className="flex-1 overflow-x-auto">
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
                        {sortedUsers.map((user) => (
                            <TableRow
                                className={`${
                                    !isAdmin ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-gray-50'
                                } ${loading ? 'opacity-50' : ''}`}
                                onClick={() => !loading && isAdmin && kliknutiRed ? kliknutiRed(user) : null}
                                key={user.id}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{user.email}</span>
                                        {user.role === 'admin' && (
                                            <PersonRegular className="text-red-600" fontSize={16} />
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    {getRoleBadge(user.role)}
                                </TableCell>

                                {isAdmin && (
                                    <TableCell>
                                        {user.schoolName ? (
                                            <div className="flex items-center gap-1">
                                                <OrganizationRegular fontSize={14} className="text-blue-600" />
                                                <span>{user.schoolName}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 italic">Bez škole</span>
                                        )}
                                    </TableCell>
                                )}

                                {isAdmin && (
                                    <TableCell>
                                        <span className="text-sm text-gray-600">
                                            {formatDate(user.createdAt)}
                                        </span>
                                    </TableCell>
                                )}

                                {isAdmin && (
                                    <TableCell>
                                        <span className="text-sm text-gray-600">
                                            {formatDate(user.updatedAt)}
                                        </span>
                                    </TableCell>
                                )}

                                {isAdmin && (
                                    <TableCell role="gridcell" tabIndex={0}>
                                        <TableCellLayout>
                                            <Button
                                                className='mr-2'
                                                onClick={(e) => otvoriModalZaEdit(e, user)}
                                                icon={<EditRegular />}
                                                aria-label="Edit"
                                                disabled={loading}
                                                size="small"
                                                appearance="subtle"
                                            />
                                            <Button
                                                className='ml-2'
                                                onClick={(e) => otvoriModalZaDelete(e, user)}
                                                icon={<DeleteRegular />}
                                                aria-label="Delete"
                                                disabled={loading || user.role === 'admin'} // Ne dozvoljavamo brisanje admin-a
                                                size="small"
                                                appearance="subtle"
                                            />
                                        </TableCellLayout>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {users.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500">
                        <PersonRegular fontSize={48} className="mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium mb-1">Nema korisnika</p>
                        <p className="text-sm">Dodajte prvi korisnički nalog</p>
                    </div>
                )}

                {/* Loading state za tabelu */}
                {loading && users.length === 0 && (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-center">
                            <Spinner size="medium" />
                            <p className="mt-2 text-gray-600">Učitavaju se korisnici...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserTable;