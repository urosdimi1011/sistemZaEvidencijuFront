import {
    Button,
    Table,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow
} from "@fluentui/react-components";
import {formatDate}  from "../../utils/formatDate";
import {
    CheckmarkRegular,
    DeleteRegular,
    DismissRegular,
    EditRegular
} from "@fluentui/react-icons";
import { useState } from "react";
import { MyInput } from "../ui/MyInput";
import * as yup from 'yup';
import { useForm,Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "../../api";

interface PaymentForm {
    iznosUplate : number;
    datumUplate : string;
}

export default function StudentPayoutDetailTable({student, onPaymentUpdate}){
    const [editId, setEditId] = useState(null);
    const [payments, setPayments] = useState(student.payments.installments);

    const columns = [
        { columnKey: "ime", label: "Ime Ucenika" },
        { columnKey: "prezime", label: "Prezime Ucenika" },
        { columnKey: "amount", label: "Iznos uplate" },
        { columnKey: "paidAt", label: "Datum uplate" },
        { columnKey: "actions", label: "Akcije" },
    ];

    const removePayoutDetail = async (id : number) => {
        try {
            const response = await api.delete(`/payments/${id}`);
            const noveUplate = payments.filter(p => p.id !== id);
            setPayments(noveUplate);

            if (onPaymentUpdate) {
                onPaymentUpdate({
                    id : response.data.deletedPayment.id,
                    noveUplate : noveUplate,
                    azuriranoStanje: response.data.student
                });
            }

        } catch (error) {
            console.error('Greška pri brisanju:', error);
        }
    }

    const editPayoutDetail = (item : any) => {
        setEditId(item.id);
        const formattedDate = new Date(item.paidAt).toISOString().split('T')[0];
        reset({
            iznosUplate: item.amount,
            datumUplate: formattedDate
        });
    }

    const cancelEdit = () => {
        setEditId(null);
        reset();
    }

    const onSubmit = async (data: PaymentForm) => {
        try {
            console.log('Ažurirani podaci:', data, 'za ID:', editId);
            
            const response = await api.patch(`/payments/${editId}`, {
                iznosZaUplatu: data.iznosUplate,
                datumUplate: data.datumUplate
            });

            if (response.data.payment) {
                setPayments(payments.map(payment => 
                    payment.id === editId 
                        ? { ...payment, amount: response.data.payment.iznosUplate, paidAt: response.data.payment.datumUplate }
                        : payment
                ));
            }

            const updatedPayments = payments.map(payment => 
                payment.id === editId 
                    ? { 
                        ...payment, 
                        amount: response.data.payment.iznosUplate, 
                        paidAt: response.data.payment.datumUplate 
                    }
                    : payment
            );

            if (onPaymentUpdate) {
                onPaymentUpdate({
                    id : response.data.payment.id,
                    noveUplate : updatedPayments,
                    azuriranoStanje: response.data.student
                });
            }
            
            setEditId(null);
            reset();
        } catch (error) {
            console.error('Greška pri ažuriranju:', error);
        }
    }

    const schema = yup.object({
        iznosUplate: yup.number().required("Iznos je obavezan"),
        datumUplate: yup.string().required("Datum je obavezan"),
    }).required();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<PaymentForm>({
        resolver: yupResolver(schema) as Resolver<PaymentForm, object, PaymentForm>,
    });

    if(!payments.length) return (<h3 className='font-bold'>Trenutno nema istorija uplata za prikaz</h3>)
    
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
                {payments.map((item) => {
                    const isEditing = editId === item.id;
                    return (
                        <TableRow key={item.id}>
                            <TableCell>
                                {student.ime}
                            </TableCell>
                            <TableCell>
                                {student.prezime}
                            </TableCell>
                            <TableCell>
                                {!isEditing ? item.amount : (
                                    <MyInput 
                                        {...register('iznosUplate')} 
                                        type="number" 
                                        control={control} 
                                        name={'iznosUplate'} 
                                    />
                                )}
                            </TableCell>
                            <TableCell>
                                {!isEditing ? formatDate(item.paidAt) : (
                                    <MyInput 
                                        {...register('datumUplate')} 
                                        type="date" 
                                        control={control} 
                                        name={'datumUplate'} 
                                    />
                                )}
                            </TableCell>
                            <TableCell>
                                {!isEditing ? (
                                    <>
                                        <Button 
                                            className="mr-3"
                                            onClick={() => editPayoutDetail(item)} 
                                            icon={<EditRegular />} 
                                            aria-label="Edit" 
                                        />
                                        <Button 
                                            onClick={() => removePayoutDetail(item.id)} 
                                            icon={<DeleteRegular />} 
                                            aria-label="Delete" 
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Button 
                                            className="mr-3"
                                            onClick={handleSubmit(onSubmit)} 
                                            icon={<CheckmarkRegular />} 
                                            aria-label="Save"
                                            appearance="primary"
                                        />
                                        <Button 
                                            onClick={cancelEdit} 
                                            icon={<DismissRegular />} 
                                            aria-label="Cancel" 
                                        />
                                    </>
                                )}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </Table>
        </>
    )
}