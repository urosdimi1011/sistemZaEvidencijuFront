import {useEffect, useState} from "react";
import {SelectTabData, SelectTabEvent, Spinner, Tab, TabList, TabValue} from "@fluentui/react-components";
import toast from "react-hot-toast";
import PaymantForm from "../forms/PaymantForm";
import ManagerPaymentsForm from "../forms/ManagerPaymentsForm";
import StudentPayoutDetailTable from "./StudentPayoutDetailTable";
import MenadzerPayoutDetailTable from "./MenadzerPayoutDetailTable";
import api from "../../api";

interface Student {
    id?: number;
    ime: string;
    prezime: string;
    imeRoditelja: string;
    zanimanje: number;
    managerId: number | null;
    ukupanDug: number;
    preostaliDug: number;
    cenaSkolarine: number;
    desc : string | null,
    note : string | null,
    literature : string | null,
    type : string,
    entry_type : string,
    procenatManagera: number | null; 
    ukupnaSkolarina: number;
}


export default function StudentDetails({student,onSuccess}){
    const [selectedValue, setSelectedValue] = useState<TabValue>('tab1');
    const [studentDetail, setStudentDetail] = useState(null);

    useEffect(()=>{
        let isMounted = true;
        if(isMounted){
            getStudentsData();
        }
        return ()=>{
            isMounted = false; 
        }
    },[student]);

    const getStudentsData = async ()=>{
            try{
                const response = await api.get<Student>(`/students/${student}`);
                console.log(response.data.student);
                setStudentDetail(response.data.student);
            }
            catch (ex : any){
                toast.error(ex.message);
            }
    }

    const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
        setSelectedValue(data.value);
    };
    const editStudent = (updatedPayment : any)=>{
         setStudentDetail(prevStudent => {
            if (!prevStudent) return prevStudent;
            return {
                ...prevStudent,
                payments: {
                    ...updatedPayment.azuriranoStanje,
                    installments: updatedPayment.noveUplate
                }
            };
        });
    }
    const tab1Cotentent = ()=>{
        return (
            <div className='flex flex-col gap-3 text-lg'>
                <h4>Ukupno školarina: <strong className='font-bold'> {studentDetail.ukupnaSkolarina}&euro;
                    {studentDetail.literature ? (
                        <span>+ 50&euro;</span>
                    ) : ''}
                    </strong></h4>
                <h4>Učenik je do sad uplatio: <strong className='font-bold'>{studentDetail.payments.totalPaid}&euro;</strong></h4>
                <h4>Preostalo učeniku: <strong className='font-bold'>{studentDetail.payments.remainingAmount}&euro;</strong></h4>
                {studentDetail.payments.remainingAmount === 0 && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-lg text-center">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="bg-green-500 rounded-full p-1">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h4 className='text-green-800 font-bold text-xl'>Sve je plaćeno!</h4>
                        </div>
                        <p className="text-green-700 mt-2">Učenik je uspešno izmirio sve obaveze.</p>
                    </div>
                )}
                <div className="mt-5">
                    <h4 className='font-bold'>Napomena za učenika:</h4>
                    <p className="text-gray-400">{studentDetail.note ?? 'Nema napomene za učenika'}</p>
                </div>
            </div>
        )
    }
    const tab2Content = ()=>{
        return (
            <>
                <PaymantForm onSuccess={onSuccess} id={studentDetail.id}></PaymantForm>
                <StudentPayoutDetailTable student={studentDetail} onPaymentUpdate={editStudent}></StudentPayoutDetailTable>
            </>
        )
    }
    const tab3Content = ()=>{
        if (!studentDetail?.managerPayments) {
            return <div className="text-gray-500">Nema podataka o isplatama menadžeru.</div>
        }
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
                <Tab className='!border-0 !outline-0' value="tab1">Školarina</Tab>
                <Tab className='!outline-0' value="tab2">Uplata školarine</Tab>
                {studentDetail.managerId != null && (
                <Tab className='!outline-0' value="tab3">Isplata (Menadžeru)</Tab>
                )}
            </TabList>
            <div className='py-10 px-4 min-h-50'>

                {selectedValue === 'tab1' && <div key="tab1">{tab1Cotentent()}</div>}
                {selectedValue === 'tab2' && <div key="tab2">{tab2Content()}</div>}
                {selectedValue === 'tab3' && <div key="tab3">{tab3Content()}</div>}
            </div>
        </>
    )

}

