import {Dropdown, Label, Option, SelectionEvents, OptionOnSelectData, makeStyles, Input} from "@fluentui/react-components";
import {useEffect, useState} from "react";
import { Search20Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
    root: {
        display: "grid",
        gridTemplateRows: "repeat(1fr)",
        justifyItems: "start",
        gap: "2px",
    },
    searchContainer: {
        width: "100%",
        marginBottom: "0px",
    },
    dropdownWithScroll: {
        "& .fui-Dropdown__listbox": {
            maxHeight: "100px",
            overflowY: "auto",
        }
    },
    dropdownWithLargeScroll: {
        "& .fui-Dropdown__listbox": {
            maxHeight: "200px",
            overflowY: "auto",
        }
    }
});

interface DropdownOption {
    value: number | null;
    label: string;
    selected?: boolean;
}

interface MyDropdownProps {
    id: string;
    name: string;
    label: string;
    options: DropdownOption[];
    onChange: (obj: { name: string; value: number | null }) => void;
    value: number | null;
    disabled?: boolean;
    placeHolder?: string;
    // Nove opcije
    searchable?: boolean;          // Omogućava search
    maxHeight?: 'default' | 'medium' | 'large';  // Visina dropdown-a
    searchPlaceholder?: string;    // Placeholder za search
    noOptionsText?: string;        // Tekst kada nema rezultata
}

export default function MyDropdown({
                                       id,
                                       name,
                                       label,
                                       options,
                                       onChange,
                                       value,
                                       disabled = false,
                                       placeHolder = '',
                                       searchable = false,
                                       maxHeight = 'default',
                                       searchPlaceholder = 'Pretraži...',
                                       noOptionsText = 'Nema rezultata'
                                   }: MyDropdownProps) {
    const styles = useStyles();
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [labelTextForSelected, setLabelTextForSelected] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState<DropdownOption[]>(options);

    // Filter opcije na osnovu search term-a
    useEffect(() => {
        if (!searchable || !searchTerm.trim()) {
            setFilteredOptions(options);
        } else {
            const filtered = options.filter(option =>
                option.label.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredOptions(filtered);
        }
    }, [searchTerm, options, searchable]);

    useEffect(() => {
        if (value !== null) {
            setSelectedOptions([String(value)]);
            const selectedOption = options.find(opt => opt.value == value);
            setLabelTextForSelected(selectedOption ? selectedOption.label : '');
        } else {
            setSelectedOptions([]);
            setLabelTextForSelected('');
        }
    }, [value, options]);

    const handleOptionSelect = (
        _ev: SelectionEvents,
        data: OptionOnSelectData
    ) => {
        let newValue: number | null | string = null;
        if (data.optionValue && data.optionValue !== 'null') {
            if(typeof data.optionValue === 'string'){
                const numValue = data.optionValue;
                newValue = numValue;
            } else{
                const numValue = Number(data.optionValue);
                newValue = isNaN(numValue) ? null : numValue;
            }
        }

        const obj = { name, value: newValue };
        setLabelTextForSelected(data.optionText ?? "");
        setSelectedOptions(data.selectedOptions);
        onChange(obj);

        // Reset search kad se izabere opcija
        if (searchable) {
            setSearchTerm('');
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    // Određuj CSS klasu na osnovu maxHeight
    const getDropdownClassName = () => {
        let className = 'w-full';
        if (maxHeight === 'medium') {
            className += ` ${styles.dropdownWithScroll}`;
        } else if (maxHeight === 'large') {
            className += ` ${styles.dropdownWithLargeScroll}`;
        }
        return className;
    };

    return (
        <div className={styles.root}>
            <Label htmlFor={id}>{label}</Label>

            {searchable && (
                <div className={styles.searchContainer}>
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        contentBefore={<Search20Regular />}
                        className='block w-full'
                    />
                </div>
            )}

            <Dropdown
                className={getDropdownClassName()}
                selectedOptions={selectedOptions}
                placeholder={placeHolder}
                value={labelTextForSelected}
                inlinePopup={true}
                id={id}
                name={name}
                disabled={disabled}
                onOptionSelect={handleOptionSelect}
            >
                {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => {
                        const optionValue = option.value !== null ? String(option.value) : 'null';
                        return (
                            <Option value={optionValue} key={optionValue}>
                                {option.label}
                            </Option>
                        );
                    })
                ) : searchable && searchTerm ? (
                    <Option disabled value="no-results">
                        {noOptionsText}
                    </Option>
                ) : null}
            </Dropdown>
        </div>
    );
}