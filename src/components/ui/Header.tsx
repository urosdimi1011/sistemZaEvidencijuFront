import {Link, NavLink} from "react-router";
import { NavigationFilled, PersonDeleteRegular,PersonColor,CalendarColor,PaymentRegular} from "@fluentui/react-icons";
import {Button, Persona} from "@fluentui/react-components";
import {useMemo} from "react";
import {useAuth} from "../../Provides/AuthProvider";
import logoImage from '/public/logo.png';
const navigationLinksByRole = {
    admin: [
        {
            'id': 1,
            'title': 'Učenici',
            'href': "/ucenici",
            'icon': <PersonColor />
        },
        {
            'id': 2,
            'title': 'Menadžeri',
            'href': "/menadzeri",
            'icon': <PersonColor />
        },
        {
            'id': 3,
            'title': 'Statistika',
            'href': "/",
            'icon': <CalendarColor />
        },
        {
            'id': 4,
            'title': 'Statistika uplata',
            'href': "/ocekivane-uplate",
            'icon': <PaymentRegular />
        },
        {
            'id': 5,
            'title': 'Korisnički nalozi',
            'href': "/korisnici",
            'icon': <PersonColor />
        },
    ],
    school_manager: [
        {
            'id': 1,
            'title': 'Učenici',
            'href': "/ucenici",
            'icon': <PersonColor />
        }
    ],

};
export default function Header({className,handleLogout}){
    const { currentUser } = useAuth();

    const navigationLinks = useMemo(() => {
        if (!currentUser || !currentUser.role) return [];
        return navigationLinksByRole[currentUser.role] || [];
    }, [currentUser?.role]);

    const renderListElement = navigationLinks.map(item => (
        <li className={'border border-gray-700/20 hover:bg-gray-200 transition duration-300'} key={item.id}>
            <NavLink
                className={({ isActive }) =>
                    isActive
                        ? "py-3 !text-[#0f6cbd] font-bold underline !text-xl transition block !w-full !h-full px-3 flex items-center gap-2"
                        : "py-3 !text-black hover:text-white !text-xl transition block !w-full !h-full px-3 flex items-center gap-2"
                }
                to={item.href}
            >
                {item.icon}
                <span>{item.title}</span>
            </NavLink>
        </li>
    ));

    const getRoleDisplayName = (role) => {
        switch (role) {
            case 'admin': return 'Administrator';
            case 'school_manager': return 'Menadžer škole';
            default: return role;
        }
    };
    console.log(currentUser);
    return(
        <header className={
            "min-h-screen shadow-2xl py-5 border-r-2 border-[#0f6cbd]/50 flex flex-col justify-between " +
            className
        }>

            <div className="">
                <h3 className='text-gray-500 font-bold text-xs flex gap-2 items-center pl-3'><NavigationFilled />Navigacija</h3>


                {!currentUser && (
                    <div className="px-3 mt-4">
                        <div className="animate-pulse">
                            <div className="bg-gray-200 rounded h-4 mb-2"></div>
                            <div className="bg-gray-200 rounded h-4 w-3/4"></div>
                        </div>
                    </div>
                )}

                <div className="header">
                    <ul className='mt-7'>
                        {renderListElement}
                    </ul>
                </div>
                <div className='w-60'>
                    <img className='w-full' src='logo.png' alt='logo'/>
                </div>
                {currentUser && (
                    <div className="px-3 mt-4 mb-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                            <div className="text-sm">
                                <div className="font-semibold text-blue-900 truncate" title={currentUser.email}>
                                    {currentUser.email}
                                </div>
                                <div className="text-blue-700 font-medium">
                                    {getRoleDisplayName(currentUser.role)}
                                </div>
                                {currentUser.school && (
                                    <div className="text-blue-600 text-xs mt-1 font-medium">
                                        🏫 {currentUser.school.name}
                                    </div>
                                )}
                                {!currentUser.school && currentUser.role !== 'admin' && (
                                    <div className="text-orange-600 text-xs mt-1">
                                        ⚠️ Nije dodeljena škola
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className='footerHeader mt-auto px-3'>
                <Button
                    onClick={handleLogout}
                    className='!text-[#0f6cbd] !text-lg flex items-center gap-2 w-full justify-start'
                >
                    <PersonDeleteRegular />
                    <span>Izloguj se</span>
                </Button>

                <div className="text-xs text-gray-400 mt-2 text-center">
                    Dositej škola - Sistem za evidencije
                </div>
            </div>
        </header>
    )
}