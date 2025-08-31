import {useEffect, useState} from 'react';
import Select from 'react-select';
import {useController} from "react-hook-form";

// const occupationOptions = [
//     {
//         label: "IT Sektor",
//         options: [
//             { value: 1, label: "Frontend Developer" },
//             { value: 2, label: "Backend Developer" },
//             { value: 3, label: "Fullstack Developer" },
//             { value: 4, label: "DevOps Engineer" }
//         ]
//     },
//     {
//         label: "Dizajn",
//         options: [
//             { value: 5, label: "UI/UX Dizajner" },
//             { value: 6, label: "Grafički Dizajner" },
//             { value: 7, label: "Web Dizajner" }
//         ]
//     },
//     {
//         label: "Ostalo",
//         options: [
//             { value: 8, label: "Project Manager" },
//             { value: 9, label: "Data Scientist" },
//             { value: 10, label: "QA Engineer" }
//         ]
//     }
// ];

const OccupationDropdown = ( props ) => {
    const [selectedOccupation, setSelectedOccupation] = useState(null);

    const handleChange = (selectedOption) => {
        setSelectedOccupation(selectedOption);
        props.onOccupationSelect(selectedOption);
    };

        // const {field, fieldState} = useController({
        //     name: props.name,
        //     control: props.control,
        //     defaultValue: props.defaultValue
        // });

    useEffect(() => {
        if (props.value) {
            // Pronađi opciju koja odgovara prosleđenoj vrednosti
            const findPreselectedOption = (options) => {
                for (const group of options) {
                    const foundOption = group.options.find(option =>
                        option.value === props.value || option.label === props.value
                    );
                    if (foundOption) return foundOption;
                }
                return null;
            };

            const preselected = findPreselectedOption(props.occupationOptions);
            if (preselected) {
                setSelectedOccupation(preselected);
            }
        }
    }, [props.value, props.occupationOptions]);

    const customStyles = {
        control: (provided) => ({
            ...provided,
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            padding: '4px',
            '&:hover': {
                borderColor: '#3182ce'
            }
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#3182ce' : 'white',
            color: state.isSelected ? 'white' : '#2d3748',
            '&:hover': {
                backgroundColor: '#ebf8ff',
                color: '#2c5282'
            }
        }),
        groupHeading: (provided) => ({
            ...provided,
            fontWeight: '600',
            fontSize: '14px',
            color: '#4a5568',
            backgroundColor: '#f7fafc',
            padding: '8px 12px',
            margin: 0
        })
    };

    return (
        <div className="w-full mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Odaberite zanimanje
            </label>

            <Select
                options={props.occupationOptions}
                value={selectedOccupation}
                onChange={handleChange}
                isSearchable
                placeholder="Pretražite zanimanja..."
                noOptionsMessage={() => "Nema pronađenih zanimanja"}
                styles={customStyles}
                className="basic-select"
                classNamePrefix="select"
                name={props.name}
            />

            {selectedOccupation && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        Izabrano: <strong>{selectedOccupation.label}</strong>
                    </p>
                </div>
            )}
        </div>
    );
};

export default OccupationDropdown;