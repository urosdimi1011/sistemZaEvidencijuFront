import ColorToggleCheckbox from "./ColorToggleCheckbox";
import {MyInput} from "../MyInput";
import {DatePickerMy} from "../DatePickerMy";
import { FilterFilled} from "@fluentui/react-icons";
export default function StudentsToolbar({
                                            onAdd,
                                            searchValue,
                                            onSearchChange,
                                            onDateChange,
                                            onToggleColor,
                                            onToggleManagerColor,
                                            coloredRows,
                                            coloredManagerRows
                                        }) {
    return (
        <div className='border my-6 mx-10 border-gray-700/20 shadow-sm relative rounded'>
            <div className='border-b border-r inline-block border-gray-700/20 px-5 shadow-xs'>
                <h2 className='text-lg font-semibold flex items-center gap-2'>Filteri <FilterFilled /></h2>
            </div>
            <div className='flex justify-around items-center flex-wrap gap-4 p-4'>
                <button
                    onClick={onAdd}
                    className="px-4 py-2 text-black !border-gray-700 !border-1 rounded  !transition-colors"
                >
                    Dodaj učenika
                </button>

                <MyInput
                    className='!w-1/2 min-w-[300px]'
                    label='Pretraži studenta po imenu i prezimenu'
                    value={searchValue}
                    name='search'
                    onInput={onSearchChange}
                />
                <DatePickerMy onDateChange={onDateChange}>

                </DatePickerMy>

                <ColorToggleCheckbox
                    id="prikaziObojeneRedove"
                    label="Obojen prikaz za školarinu"
                    onChange={onToggleColor}
                    checked={coloredRows}
                />

                <ColorToggleCheckbox
                    id="prikaziObojeneRedoveZaMenadzera"
                    label="Obojen prikaz za menadžera"
                    onChange={onToggleManagerColor}
                    checked={coloredManagerRows}
                />
            </div>
        </div>
    );
}