import {useEffect, useState} from "react";
import {SelectTabData, SelectTabEvent, Spinner, Tab, TabList, TabValue} from "@fluentui/react-components";
import toast from "react-hot-toast";
import PaymantForm from "../forms/PaymantForm";
import ManagerPaymentsForm from "../forms/ManagerPaymentsForm";
import StudentPayoutDetailTable from "./StudentPayoutDetailTable";
import MenadzerPayoutDetailTable from "./MenadzerPayoutDetailTable";
import api from "../../api";

export default function StudentDetails({student,onSuccess}){
    const [selectedValue, setSelectedValue] = useState<TabValue>('tab1');
    const [studentDetail, setStudentDetail] = useState(null);

    useEffect(()=>{
        (async ()=>{
            try{
                const response = await api.get(`/students/${student}`);
                setStudentDetail(response.data.student);
            }
            catch (ex){
                toast.error(ex.message);
            }
        })();
    },[]);

    const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
        setSelectedValue(data.value);
    };
    const tab1Cotentent = ()=>{
        return (
            <div className='flex flex-col gap-3 text-lg'>
                <h4>Ukupno školarina: <strong className='font-bold'> {studentDetail.ukupnaSkolarina}&euro;</strong></h4>
                <h4>Učenik je do sad uplatio: <strong className='font-bold'>{studentDetail.payments.totalPaid}&euro;</strong></h4>
                <h4>Preostalo učeniku: <strong className='font-bold'>{studentDetail.payments.remainingAmount}&euro;</strong></h4>
            </div>
        )
    }
    const tab2Content = ()=>{
        return (
            <>
                <PaymantForm onSuccess={onSuccess} id={studentDetail.id}></PaymantForm>
                <StudentPayoutDetailTable student={studentDetail}></StudentPayoutDetailTable>
            </>
        )
    }
    console.log(studentDetail);
    const tab3Content = ()=>{
        return (
            <>
                <ManagerPaymentsForm idMenadzera={studentDetail.managerId} onSuccess={onSuccess} id={studentDetail.id} ukupnoMenadzeru={studentDetail.ukupnoMenadzeru} preostaloMenadzeru={studentDetail.preostaloMenadzeru} managerPayments={studentDetail.managerPayments}></ManagerPaymentsForm>
                <MenadzerPayoutDetailTable menadzer={studentDetail.managerPayments}></MenadzerPayoutDetailTable>
            </>
        )
    }
    if (!studentDetail) return <Spinner></Spinner>;

    return (
        <>
            <TabList selectedValue={selectedValue} onTabSelect={onTabSelect}>
                <Tab className='!border-0 outline-0' value="tab1">Školarina</Tab>
                <Tab value="tab2">Uplata</Tab>
                <Tab value="tab3">Isplata(Menadzeru)</Tab>
            </TabList>
            <div className='py-10 px-4 min-h-50'>

                {selectedValue === 'tab1' && tab1Cotentent()}
                {selectedValue === 'tab2' && tab2Content()}
                {selectedValue === 'tab3' && tab3Content()}
            </div>
        </>
    )

}

