import { Checkbox } from "@fluentui/react-components";

export default function ColorToggleCheckbox({ id, label, onChange, checked }) {
    return (
        <div className="flex items-center gap-2">
            <label htmlFor={id}>{label}</label>
            <Checkbox
                id={id}
                onChange={onChange}
                checked={checked}
            />
        </div>
    );
}