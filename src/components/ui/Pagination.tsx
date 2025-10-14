
// Komponenta za prikaz paginacije
export function Pagination({ currentPage, totalPages, goToPage }) {
    // Funkcija za generisanje niza stranica za prikaz
    const getPageNumbers = () => {
        const delta = 2; // Koliko stranica prikazati sa svake strane trenutne
        const range = [];
        const rangeWithDots = [];

        // Ako ima malo stranica, prikaži sve
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                range.push(i);
            }
            return range;
        }

        // Prikaži prve 3 stranice, trenutnu sa delta stranica sa svake strane i poslednje 3
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        // Dodaj prvu stranicu
        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        // Dodaj srednji deo
        rangeWithDots.push(...range);

        // Dodaj poslednju stranicu
        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className='flex gap-2 justify-center items-center mt-4'>
            <button
                className='px-3 py-1 border-2 border-gray-300 rounded-md bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                onClick={()=>goToPage(currentPage-1)}
                disabled={currentPage === 1}
            >
                Prethodna
            </button>

            {pageNumbers.map((pageNumber, index) =>
                pageNumber === '...' ? (
                    <span key={`dots-${index}`} className="px-2 py-1">...</span>
                ) : (
                    <button
                        key={pageNumber}
                        className={`!border-2 !border-gray-700 ${
                            currentPage === pageNumber
                                ? '!text-gray-50 !bg-[#0f6cbd]'
                                : '!bg-gray-50'
                        }`}
                        onClick={() => goToPage(pageNumber)}
                    >
                        {pageNumber}
                    </button>
                )
            )}

            <button
                className='px-3 py-1 border-2 border-gray-300 rounded-md bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                onClick={()=>goToPage(currentPage+1)}
                disabled={currentPage === totalPages}
            >
                Sledeća
            </button>
        </div>
    );
}
