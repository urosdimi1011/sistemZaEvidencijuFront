// ConfirmManagerChangeModal.tsx
export default function ConfirmManagerChangeModal({ 
    data, 
    onConfirm, 
    onCancel 
}) {
    return (
        <>
            <h1 className='!text-xl'>Upozorenje!</h1>
            <p className='mt-3'>
                Student ima isplate prethodnom menadžeru u iznosu od{' '}
                <strong>{data.totalAmount}€</strong>.
            </p>
            <p className='mt-2 text-gray-600'>
                Ako nastavite, sve isplate prethodnom menadžeru će biti obrisane.
            </p>
            
            <div className='flex mt-5 items-center gap-3'>
                <button 
                    onClick={onConfirm}
                    className="bg-red-500 text-black px-4 py-2 rounded"
                >
                    Da, obriši isplate
                </button>
                <button 
                    onClick={onCancel}
                    className="bg-gray-300 px-4 py-2 rounded"
                >
                    Otkaži
                </button>
            </div>
        </>
    );
}