import {Link, NavLink} from "react-router";
import { NavigationFilled, PersonDeleteRegular,PersonColor,CalendarColor,PaymentRegular} from "@fluentui/react-icons";
import {Button, Persona} from "@fluentui/react-components";
const listOfNavigationLinks = [
    {
        'id':1,
        'title':'Statistika',
        'href':"/",
        icon: <CalendarColor />
    },
    {
        'id':1,
        'title':'Statistika uplata',
        'href':"/ocekivane-uplate",
        icon: <PaymentRegular />
    },
    {
        'id':2,
        'title':'Menadžeri',
        'href':"/menadzeri",
        icon: <PersonColor />
    },
    {
        'id':3,
        'title':'Učenici',
        'href':"/ucenici",
        icon: <PersonColor />
    }
]
export default function Header({className,handleLogout}){
    const renderListElement = listOfNavigationLinks.map(item=>
        <li className='py-3 border border-gray-700/20 hover:bg-gray-200 transition duration-300' key={item.id}>
            <NavLink className={({ isActive }) =>
                isActive
                    ? "!text-[#0f6cbd] font-bold underline !text-xl transition"
                    : "!text-black hover:text-white !text-xl transition"
            } to={item.href}>{item.icon} {item.title}</NavLink>
        </li>);
    return(
        <header className={
            "min-h-screen shadow-2xl py-5 border-r-2 border-[#0f6cbd]/50 flex flex-col justify-between " +
            className
        }>
            <div className="">
                <h3 className='text-gray-500 font-bold text-xs flex gap-2 items-center pl-3'><NavigationFilled />Navigacija</h3>
                <div className="header">
                    <ul className='mt-7'>
                        {renderListElement}
                    </ul>
                </div>
            </div>
            <div className='footerHeader mt-auto'>

                <Button onClick={handleLogout} className='!text-[#0f6cbd] !text-lg flex items-center gap-2'><PersonDeleteRegular />Izloguj se</Button>

            </div>
        </header>
    )
}