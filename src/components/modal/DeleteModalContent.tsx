import api from "../../api";
import toast from "react-hot-toast";

export default function DeleteModalContent({data,onSuccess,itemType}){


    const deleteStudent = async ()=>{
        try{
            const response = await api.delete(`/students/${data.id}`);
            onSuccess(response.data);
        }
        catch (error){
            const errorMessage = error.response?.data?.error?.detail ||
                error.detail ||
                `Došlo je do greške prilikom slanja podataka, Poruka(${error.message})`;
            toast.error(errorMessage);
        }

    }

    return (
        <>
            <h1 className='!text-xl'>Da li ste sigurni da želite da obrišete {itemType}?</h1>
            <div className='flex mt-5 items-center gap-3'>
                <button onClick={deleteStudent}>Da</button>
            </div>
        </>
    )
}