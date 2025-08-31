import { useEffect, useState } from 'react';
import './App.css'
import Spinner from './components/ui/Spinner';
import api from "./api";

interface Menadzer {
    id: number;
    ime: string;
    prezime: string;
}

function App() {
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
                <ul>
                    {menadzeri.map(m => (
                        <li className='text-gray-900' key={m.id}>{m.ime} {m.prezime}</li>
                    ))}
                </ul>
                <button onClick={() => setIsModalOpen(true)}>Dodaj menadzera</button>
            </>

        )
    }
    else{
        return (
            <>
                <h3 className="mt-10 text-xl">Trenutno nemate dodatih menadzera,
                    <button onClick={() => setIsModalOpen(true)}>Dodaj menadzera</button>
                </h3>

            </>

        )
    }

}

export default App
