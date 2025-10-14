import {AriaLiveAnnouncer, Button, Field, makeStyles, useAnnounce} from "@fluentui/react-components";
import {DatePicker, DatePickerProps} from "@fluentui/react-datepicker-compat";
import {useCallback, useEffect, useState} from "react";
import { addDays } from "@fluentui/react-calendar-compat";
import { Dismiss24Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
    control: {
        maxWidth: "300px",
    },
});

// 👇 Definišite props interfejs sa callback funkcijom
interface DatePickerMyProps extends Partial<DatePickerProps> {
    onDateChange?: (date: Date | null | undefined) => void;
}

export const DatePickerMy = ({ onDateChange, ...props }: DatePickerMyProps) => {
    const styles = useStyles();
    const { announce } = useAnnounce();
    const [selectedDate, setSelectedDate] = useState<Date | null | undefined>(null);

    const maxDate = new Date();

    useEffect(() => {
        setSelectedDate(props.value);
    }, [props.value]);

    // 👇 Funkcija za onemogućavanje budućih datuma
    const isDateDisabled = useCallback((date: Date): boolean => {
        return date > maxDate;
    }, [maxDate]);

    const canGoPrevious = selectedDate !== null;
    const canGoNext = selectedDate && addDays(selectedDate, 1) <= maxDate;
    const canClear = selectedDate !== null;

    // 👇 Funkcija koja ažurira lokalno stanje i obaveštava roditelja
    const updateDate = useCallback((newDate: Date | null | undefined) => {
        setSelectedDate(newDate);
        if (onDateChange) {
            onDateChange(newDate);
        }
    }, [onDateChange]);

    const goPrevious = useCallback(() => {
        const currentDate = selectedDate || new Date();
        const newDate = addDays(currentDate, -1);
        updateDate(newDate);
    }, [selectedDate, updateDate]);

    const goNext = useCallback(() => {
        const currentDate = selectedDate || new Date();
        const newDate = addDays(currentDate, 1);

        if (newDate > maxDate) {
            announce("Ne možete izabrati datum u budućnosti");
            return;
        }

        announce(newDate.toDateString());
        updateDate(newDate);
    }, [selectedDate, maxDate, announce, updateDate]);

    const clearDate = useCallback(() => {
        updateDate(null);
        announce("Datum poništen - prikazuju se svi učenici");
    }, [updateDate, announce]);

    const handleDateSelect = (date: Date | null | undefined) => {
        if (!date) {
            updateDate(null);
            return;
        }

        if (date > maxDate) {
            announce("Ne možete izabrati datum u budućnosti");
            // 👇 Vratite selektovani datum na prethodnu vrednost
            return;
        }

        updateDate(date);
    };

    return (
        <AriaLiveAnnouncer>
            <div>
                <Field label="Izaberi dan u kom su se učenici upisali">
                    <DatePicker
                        value={selectedDate}
                        onSelectDate={handleDateSelect}
                        placeholder="Izaberi dan..."
                        className={styles.control}
                        // 👇 Dodajte prop za onemogućavanje datuma
                        minDate={new Date(1900, 0, 1)} // Opcionalno: postavite minimalni datum
                        maxDate={maxDate} // Maksimalni datum je danas
                        // 👇 Ili koristite custom funkciju za onemogućavanje
                        // disabledDate={isDateDisabled}
                        {...props}
                        isMonthPickerVisible={false}
                    />
                </Field>
                <div className='mt-3'>
                    <Button disabled={!canGoPrevious} onClick={goPrevious}>
                        Prethodni dan
                    </Button>
                    <Button disabled={!canGoNext} onClick={goNext}>
                        Naredni
                    </Button>
                    <Button
                        disabled={!canClear}
                        onClick={clearDate}
                        icon={<Dismiss24Regular />}
                        appearance="subtle"
                    >
                        Poništi filter
                    </Button>
                </div>
            </div>
        </AriaLiveAnnouncer>
    );
};