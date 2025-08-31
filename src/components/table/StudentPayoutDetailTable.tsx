import {
    Table,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow
} from "@fluentui/react-components";
import {formatDate}  from "../../utils/formatDate";


export default function StudentPayoutDetailTable({student}){
    const columns = [
        { columnKey: "ime", label: "Ime Ucenika" },
        { columnKey: "prezime", label: "Prezime Ucenika" },
        { columnKey: "amount", label: "Iznos uplate" },
        { columnKey: "paidAt", label: "Datum uplate" },
    ];
    if(!student.payments.installments.length) return (<h3 className='font-bold'>Trenutno nema istorija uplata za prikaz</h3>)
    return (
        <>
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
                {student.payments.installments.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>
                            {student.ime}
                        </TableCell>
                        <TableCell>
                            {student.prezime}
                        </TableCell>
                        <TableCell>
                            {item.amount}
                        </TableCell>
                        <TableCell>
                            { formatDate(item.paidAt)}
                        </TableCell>
                    </TableRow>
                ))}
            </Table>
        </>
    )

}

