import { makeStyles, useId, Input, Label } from "@fluentui/react-components";
import {useController} from "react-hook-form";
// import type { InputProps } from "@fluentui/react-components";

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        width:"100%"
    },
});

export const MyInput = (props) => {
    const inputId = useId("input");
    const styles = useStyles();
    if (props.name && props.control) {
        const { field, fieldState } = useController({
            name: props.name,
            control: props.control,
            defaultValue: props.defaultValue
        });

        return (
            <div className={`${styles.root} ${props.className ?? ''}`}>
                <Label htmlFor={inputId} size={props.size} disabled={props.disabled}>
                    {props.label}
                </Label>
                <Input
                    id={inputId}
                    {...props}
                    {...field}
                    onChange={(e, data) => field.onChange(data.value)}
                    value={field.value || ""}
                    state={fieldState.error ? "error" : undefined}
                />
            </div>
        );
    }
    return (
        <div className={`${styles.root} ${props.className ?? ''}`}>
            <Label htmlFor={inputId} size={props.size} disabled={props.disabled}>
                {props.label}
            </Label>
            <Input id={inputId} {...props} />
        </div>
    );
};