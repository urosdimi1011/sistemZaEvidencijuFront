import {
    TableBody,
    TableCell,
    TableRow,
    Table,
    TableHeader,
    TableHeaderCell,
    TableCellLayout,
    Button
} from "@fluentui/react-components";
import {
    EditRegular,
    DeleteRegular
} from "@fluentui/react-icons";
import {usePagination} from "../../utils/usePagination";
import {formatDate}  from "../../utils/formatDate";

const columns = [
    { columnKey: "ime", label: "Ime Ucenika" },
    { columnKey: "ime", label: "Ime Roditelja" },
    { columnKey: "prezime", label: "Prezime Ucenika" },
    { columnKey: "zanimanje", label: "Zanimanje ucenika" },
    { columnKey: "cenaSkolarine", label: "Cena školarine" },
    { columnKey: "procenatMenadzeru", label: "Procenat menadzeru " },
    { columnKey: "menadzer", label: "Menadzer za studenta" },
    { columnKey: "actions", label: "Akcija" },
    { columnKey: "datumKreiranja", label: "Datum kreiranja" },
];
function StudentTable({studenti,kliknutiRed,obojeniRedovi,obojeniRedoviZaMenadzere,kliknutoNaDugmeEdit,kliknutoNaDugmeDelete}){
    const {
        currentPage,
        currentItems,
        totalPages,
        nextPage,
        prevPage,
        goToPage,
        itemsPerPage,
        setItemsPerPage
    } = usePagination(studenti);


    const daLiSuObojeniRedovi = (student)=>{
        if (obojeniRedovi) return obojeniRedoviZaSkolarinu(student);
        if (obojeniRedoviZaMenadzere) return obojeniRedoviZaMenadzera(student);
        return '';
    }


    const obojeniRedoviZaSkolarinu = (student)=>{

        if(student.preostaliDug === 0) return 'bg-green-600 !text-gray-50 hover:!bg-green-600'
        if(student.preostaliDug > 0) return 'bg-red-600 !text-gray-50 hover:!bg-red-600'
    }

    const obojeniRedoviZaMenadzera = (student)=>{
        console.log(student);
        if(student.preostaliDugZaMenadzera === 0) return 'bg-green-600 !text-gray-50 hover:!bg-green-600'
        if(student.preostaliDugZaMenadzera > 0) return 'bg-red-600 !text-gray-50 hover:!bg-red-600'

    }

    const otvoriModalZaEdit = (e,item)=>{
        e.stopPropagation();
        console.log(item);
        kliknutoNaDugmeEdit(item);
    }
    const otvoriModalZaDelete = (e,item)=>{
        e.stopPropagation();
        kliknutoNaDugmeDelete(item);

    }

    return (
        <div className='flex flex-col gap-5 h-screen'>
            <div className='ml-10'>
                <h3 className='text-lg font-semibold'>Ukupan broj učenika: {studenti.length}</h3>
            </div>
            <Table
                noNativeElements
                aria-label="Table without semantic HTML elements"
            >
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHeaderCell sortable={true} sortDirection={'descending'} className='!font-semibold text-shadow-xs' key={column.columnKey}>
                                {column.label}
                            </TableHeaderCell>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentItems.map((item) => (
                        <TableRow className={daLiSuObojeniRedovi(item) || ''} onClick={()=>kliknutiRed(item)} key={item.id}>
                            <TableCell>
                                {item.ime}
                            </TableCell>
                            <TableCell>
                                {item.imeRoditelja}
                            </TableCell>
                            <TableCell>
                                {item.prezime}
                            </TableCell>
                            <TableCell>
                                {item.zanimanje?.name}
                            </TableCell>
                            <TableCell>
                                {item.cenaSkolarine}&euro;
                            </TableCell>
                            <TableCell>
                                {item.procenatMenadzeru}%
                            </TableCell>
                            <TableCell>
                                {item.menadzer.ime}
                            </TableCell>
                            <TableCell role="gridcell" tabIndex={0} >
                                <TableCellLayout>
                                    <Button className='mr-2' onClick={(e)=>otvoriModalZaEdit(e,item)} icon={<EditRegular />} aria-label="Edit" />
                                    <Button className='ml-2' onClick={(e)=>otvoriModalZaDelete(e,item)} icon={<DeleteRegular />} aria-label="Delete" />
                                </TableCellLayout>
                            </TableCell>
                            <TableCell>
                                {formatDate(item.datumKreiranja)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className='flex gap-2 justify-center'>

                {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            className={`!border-2 !border-gray-700' ${currentPage === i + 1 ? '!text-gray-50 !bg-[#0f6cbd]' : '!bg-gray-50'}`}
                            key={i + 1}
                            onClick={() => goToPage(i + 1)}
                            disabled={currentPage === i + 1}
                        >
                            {i + 1}
                        </button>
                ))}

                <button className='!border-2 !border-gray-700' onClick={nextPage} disabled={currentPage === totalPages}>
                    Sledeća
                </button>
            </div>

        </div>
    );
}

export default StudentTable;