import {
    Table,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow
} from "@fluentui/react-components";
import {formatDate}  from "../../utils/formatDate";


export default function MenadzerPayoutDetailTable({menadzer}){
    const columns = [
        { columnKey: "amount", label: "Iznos isplate" },
        { columnKey: "description", label: "Opis isplate" },
        { columnKey: "paidAt", label: "Datum" },
    ];
    console.log(menadzer);
    if(!menadzer.installments.length) return (<h3 className='font-bold'>Trenutno nema istorija uplata za prikaz</h3>)
    return (
        <>
            <h3 className='my-2 font-bold'>Istorija uplata</h3>
            <Table
                noNativeElements
                aria-label="Table without semantic HTML elements"
            >
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHeaderCell key={column.columnKey}>
                                {column.label}
                            </TableHeaderCell>
                        ))}
                    </TableRow>
                </TableHeader>
                {menadzer.installments.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>
                            {item.amount}&euro;
                        </TableCell>
                        <TableCell>
                            {item.description === "" ? 'Nema opis' : item.description}
                        </TableCell>
                        <TableCell>
                            {formatDate(item.paidAt)}
                        </TableCell>
                    </TableRow>
                ))}
            </Table>
        </>
    )

}

