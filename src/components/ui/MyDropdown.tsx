import {Dropdown, Label, Option, SelectionEvents, OptionOnSelectData, makeStyles} from "@fluentui/react-components";
import {useEffect, useState} from "react";

const useStyles = makeStyles(
    {
        root:
            { display: "grid",
                gridTemplateRows: "repeat(1fr)",
                justifyItems: "start",
                gap: "2px",
            },
    });
export default function MyDropdown({  id,
                                       name,
                                       label,
                                       options,
                                       onChange,
                                       value,
                                   placeHolder = ''}) {


    const style = useStyles();
    const [selectedOptions,setSelectedOptions] = useState(value !== undefined && value !== null ? [String(value)] : []);
    const [labelTextForSelected, setLabelTextForSelected] = useState('');

    useEffect(() => {
        // Ažuriraj selectedOptions kada se promeni value
        setSelectedOptions(value !== undefined && value !== null ? [String(value)] : []);

        // Pronađi label za selektovanu opciju
        if (value !== undefined && value !== null) {
            const selectedOption = options.find(opt => String(opt.value) === String(value));
            setLabelTextForSelected(selectedOption ? selectedOption.label : '');
        } else {
            setLabelTextForSelected('');
        }
    }, [value, options]);

    const handleOptionSelect = (
        _ev: SelectionEvents,
        data: OptionOnSelectData
    ) => {
        const obj = {
            name,
            value : data.optionValue
        };
        setLabelTextForSelected(data.optionText ?? "")
        setSelectedOptions(data.selectedOptions)
        onChange(obj)
    };
    return (
        <>
            <div className={style.root}>
                <Label htmlFor={id}>{label}</Label>
                <Dropdown className='w-full'
                          defaultSelectedOptions={selectedOptions}
                          placeholder={placeHolder}
                          value={labelTextForSelected}
                          inlinePopup={true}
                          id={id}
                          name={name}
                          onOptionSelect={handleOptionSelect}
                >
                            {options.map((option) => (
                                <Option selected={option.selected} value={option.value.toString()} key={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                </Dropdown>
            </div>
        </>
    )
}