import {Suspense, useCallback, useEffect, useState} from 'react';
import axios from 'axios';
import Spinner from '../components/ui/Spinner';
import Modal from "../components/modal/Modal";
import UserTable from "../components/table/UserTable";
import api from "../api";
// import UserModal from "../components/modal/user/UserModal";
import toast from "react-hot-toast";
import EmptyState from "../components/ui/EmptyState";
import {Button, Dropdown, Option} from "@fluentui/react-components";
import {FilterFilled} from "@fluentui/react-icons/lib/fonts";
import UserModal from "../components/modal/user/UserModal";

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

function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [schools, setSchools] = useState<School[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [selectedSchool, setSelectedSchool] = useState<string>('');

    const imaLiKorisnika = !!users.length;
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [modalConfig, setModalConfig] = useState({
        viewType: 'add',
        user: null,
        title: 'Dodaj novog korisnika'
    });

    // Učitavanje korisnika i škola
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [usersRes, schoolsRes] = await Promise.all([
                    api.get<User[]>('/users'),
                    api.get<School[]>('/occupations')
                ]);


                setUsers(usersRes.data);
                setFilteredUsers(usersRes.data);
                setSchools(schoolsRes.data);
            } catch (err) {
                console.error(err);
                toast.error('Greška pri učitavanju podataka');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Filtriranje korisnika
    useEffect(() => {
        let filtered = users;

        if (selectedRole) {
            filtered = filtered.filter(user => user.role === selectedRole);
        }

        if (selectedSchool) {
            if (selectedSchool === 'bez_skole') {
                filtered = filtered.filter(user => !user.schoolId);
            } else {
                filtered = filtered.filter(user => user.schoolId === parseInt(selectedSchool));
            }
        }

        setFilteredUsers(filtered);
    }, [users, selectedRole, selectedSchool]);

    const handleSuccess = useCallback((type, data) => {
        if (type === 'add') {
            setUsers(prev => [data, ...prev]);
            toast.success('Uspešno ste dodali novog korisnika', { duration: 3000 });
        } else if (type === 'edit') {
            setUsers(prev => prev.map(u => u.id === data.id ? data : u));
            toast.success('Uspešno ste izmenili korisnika', { duration: 3000 });
        } else if (type === 'delete') {
            setUsers(prev => {
                return prev.filter(u => u.id !== data.id)
            });
            toast.success('Uspešno ste obrisali korisnika', { duration: 3000 });
        }
        setIsModalOpen(false);
    }, []);

    const handleDeleteUser = useCallback((user) => {
        setModalConfig({
            viewType: 'delete',
            user: user,
            title: `Brisanje korisnika (${user.email})`
        });
        setIsModalOpen(true);
    }, []);

    const handleAddUser = useCallback(() => {
        setModalConfig({
            viewType: 'add',
            user: null,
            title: `Dodajte korisnika`
        });
        setIsModalOpen(true);
    }, []);

    const handleEditUser = useCallback((user) => {
        setModalConfig({
            viewType: 'edit',
            user: user,
            title: `Izmeni korisnika (${user.email})`
        });
        setIsModalOpen(true);
    }, []);

    const clearFilters = useCallback(() => {
        setSelectedRole('');
        setSelectedSchool('');
    }, []);

    const roleOptions = [
        { key: 'admin', text: 'Administrator' },
        { key: 'school_manager', text: 'Menadžer škole' },
        { key: 'korisnik', text: 'Korisnik' }
    ];

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className='space-y-6'>
            <div className='border my-6 mx-10 border-gray-700/20 shadow-sm relative rounded bg-gray-100'>
                <div className='border-b border-r inline-block border-gray-700/20 px-5 shadow-xs'>
                    <h2 className='text-lg font-semibold flex items-center gap-2 text-gray-500'>
                        Filteri <FilterFilled />
                    </h2>
                </div>
                <div className='flex items-center flex-wrap gap-4 p-4'>
                    <Button onClick={handleAddUser}>Dodaj korisnika</Button>

                    <div className="flex items-center gap-3">
                        <Dropdown
                            placeholder="Filtriraj po ulozi"
                            value={selectedRole}
                            selectedOptions={selectedRole ? [selectedRole] : []}
                            onOptionSelect={(_, data) => setSelectedRole(data.optionValue || '')}
                        >
                            <Option key="" value="">Sve uloge</Option>
                            {roleOptions.map(role => (
                                <Option key={role.key} value={role.key}>
                                    {role.text}
                                </Option>
                            ))}
                        </Dropdown>

                        <Dropdown
                            placeholder="Filtriraj po školi"
                            value={selectedSchool}
                            selectedOptions={selectedSchool ? [selectedSchool] : []}
                            onOptionSelect={(_, data) => setSelectedSchool(data.optionValue || '')}
                        >
                            <Option key="" value="">Sve škole</Option>
                            <Option key="bez_skole" value="bez_skole">Bez škole</Option>
                            {schools.map(school => (
                                <Option key={school.id} value={school.id.toString()}>
                                    {school.name}
                                </Option>
                            ))}
                        </Dropdown>

                        {(selectedRole || selectedSchool) && (
                            <Button
                                appearance="subtle"
                                onClick={clearFilters}
                            >
                                Očisti filtere
                            </Button>
                        )}
                    </div>

                    <div className="text-sm text-gray-600">
                        Prikazano: {filteredUsers.length} / {users.length} korisnika
                    </div>
                </div>
            </div>

            {imaLiKorisnika ? (
                <UserTable
                    users={filteredUsers}
                    schools={schools}
                    kliknutoNaDugmeDelete={handleDeleteUser}
                    kliknutoNaDugmeEdit={handleEditUser}
                />
            ) : (
                <Suspense fallback={<Spinner />}>
                    <EmptyState message="Nema učitanih korisnika" />
                </Suspense>
            )}

            <UserModal
                isOpen={isModalOpen}
                config={modalConfig}
                schools={schools}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
            />
        </div>
    );
}

export default Users;