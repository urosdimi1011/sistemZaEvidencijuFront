import { useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from '../components/ui/Spinner';
import Modal from "../components/modal/Modal";
import AddMenadzerForm from "../components/forms/AddMenadzerForm";
import MenadzerTable from "../components/table/MenadzerTable";
import api from "../api";

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

    if(loading){
        return <Spinner />;
    }
    else if(imaLiMenadzera){
        return (
            <>
                <button onClick={() => setIsModalOpen(true)}>Dodaj menadzera</button>
                <MenadzerTable menadzeri={menadzeri}></MenadzerTable>
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Dodaj novog menadžera"
                >
                    <AddMenadzerForm
                        onSuccess={(novi) =>{
                            setMenadzeri(prev => [...prev, novi]);
                            setIsModalOpen(false)
                            }}
                    />
                </Modal>
            </>

        )
    }
    else{
        return (
            <>
                <h3 className="mt-10 text-xl">Trenutno nemate dodatih menadzera,
                    <button onClick={() => setIsModalOpen(true)}>Dodaj menadzera</button>
                </h3>
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Dodaj novog menadžera"
                >
                    <AddMenadzerForm
                        onSuccess={(novi) =>{
                            setMenadzeri(prev => [...prev, novi]);
                            setIsModalOpen(false)
                        }}
                    />
                </Modal>
            </>

        )
    }

}

export default Managers
