import {
    TableBody,
    TableCell,
    TableRow,
    Table,
    TableHeader,
    TableHeaderCell,
    TableCellLayout,
    Button,
} from "@fluentui/react-components";
    import {formatDate}  from "../../utils/formatDate";
import {
    EditRegular,
    DeleteRegular
} from "@fluentui/react-icons";

const columns = [
    { columnKey: "ime", label: "Ime Menadzera" },
    { columnKey: "prezime", label: "Prezime Menadzera" },
    { columnKey: "datumKreiranja", label: "Datum kreiranja" },
    { columnKey: "datumIzmene", label: "Datum izmene" },
    { columnKey: "studentsCount", label: "Broj studenata" },
    { columnKey: "actions", label: "Akcija" },

];
function MenadzerTable({menadzeri}){
    console.log(menadzeri);
    return (
        <Table
            noNativeElements
            aria-label="Table without semantic HTML elements"
            style={{ minWidth: "500px" }}
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
            <TableBody>
                {menadzeri.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>
                            {item.ime}
                        </TableCell>
                        <TableCell>
                            {item.prezime}
                        </TableCell>
                        <TableCell>
                            {formatDate(item.datumKreiranja)}
                        </TableCell>
                        <TableCell>
                            {formatDate(item.datumIzmene)}
                        </TableCell>
                        <TableCell>
                            {item.studentsCount}
                        </TableCell>
                        <TableCell role="gridcell" tabIndex={0} >
                            <TableCellLayout>
                                <Button icon={<EditRegular />} aria-label="Edit" />
                                <Button icon={<DeleteRegular />} aria-label="Delete" />
                            </TableCellLayout>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default MenadzerTable;