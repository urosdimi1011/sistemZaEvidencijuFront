import {useCallback, useEffect, useState} from 'react';
import axios from 'axios';
import Spinner from '../components/ui/Spinner';
import Modal from "../components/modal/Modal";
import AddMenadzerForm from "../components/forms/AddMenadzerForm";
import MenadzerTable from "../components/table/MenadzerTable";
import api from "../api";
import StudentsModal from "../components/ui/students/StudentsModal";
import ManagerModal from "../components/modal/manager/ManagerModal";
import toast from "react-hot-toast";

interface Menadzer {
    id?: number;
    ime: string;
    prezime: string;
    datumKreiranja: string;
    datumIzmene: string;
    students: object,
    studentsCount : number;
}

function Managers() {
    const [count, setCount] = useState(0)
    const [menadzeri, setMenadzeri] = useState<Menadzer[]>([]);
    const imaLiMenadzera = !!menadzeri.length;
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [modalConfig, setModalConfig] = useState({
        viewType: 'add',
        menadzer: null,
        title: 'Dodaj novog menadzera'
    });

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await api.get<Menadzer[]>('/menadzeri');
                setMenadzeri(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSuccess = useCallback((type, data) => {
        if (type === 'add') {
            setMenadzeri(prev => [data,...prev]);
            toast.success('Uspešno ste dodali novog studenta', { duration: 3000 });
        } else if (type === 'edit') {
            setMenadzeri(prev => prev.map(s => s.id === data.id ? data : s));
            toast.success('Uspešno ste izmenili menadzera', { duration: 3000 });
        }
        else if (type === 'delete') {
            setMenadzeri(prev => prev.filter(s => s.id !== data.data.id));
            toast.success('Uspešno ste obrisali menadzera', { duration: 3000 });
        }
        setIsModalOpen(false);
    }, []);

    const handleDeleteStudent = useCallback((menadzer) => {
        setModalConfig({
            viewType: 'delete',
            menadzer: menadzer,
            title: `Brisanje menadzera (${menadzer.ime} ${menadzer.prezime})`
        });
        setIsModalOpen(true);
    }, [])


    if(loading){
        return <Spinner />;
    }
    else if(imaLiMenadzera){
        return (
            <>
                <button onClick={() => setIsModalOpen(true)}>Dodaj menadzera</button>
                <MenadzerTable
                    menadzeri={menadzeri}
                    kliknutoNaDugmeDelete={handleDeleteStudent}

                ></MenadzerTable>
                <ManagerModal
                    isOpen={isModalOpen}
                    config={modalConfig}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            </>

        )
    }
    else{
        return (
            <>
                <h3 className="mt-10 text-xl">Trenutno nemate dodatih menadzera,
                    <button onClick={() => setIsModalOpen(true)}>Dodaj menadzera</button>
                </h3>
                <ManagerModal
                    isOpen={isModalOpen}
                    config={modalConfig}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            </>

        )
    }

}

export default Managers
