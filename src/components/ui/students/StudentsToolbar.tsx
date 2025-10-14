import ColorToggleCheckbox from "./ColorToggleCheckbox";
import { MyInput } from "../MyInput";
import { DatePickerMy } from "../DatePickerMy";
import { FilterFilled } from "@fluentui/react-icons";
import { Button } from "@fluentui/react-components";
import { Search24Regular } from "@fluentui/react-icons/lib/fonts";
import { useAuth } from "../../../Provides/AuthProvider";
export default function StudentsToolbar({
  onAdd,
  searchValue,
  onSearchChange,
  onDateChange,
  selectedDate = null,
  onToggleColor,
  onToggleManagerColor,
  coloredRows,
  coloredManagerRows,
}) {
  const { currentUser } = useAuth();
  const isSchoolManager = currentUser?.role === "school_manager";
  const userSchoolId = currentUser?.schoolId;
  return (
    <div className="border my-6 mx-10 border-gray-700/20 shadow-sm relative rounded bg-gray-100">
      <div className="border-b border-r inline-block border-gray-700/20 px-5 shadow-xs">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-500">
          Filteri <FilterFilled />
        </h2>
      </div>
      <div className="flex justify-around items-center flex-wrap gap-4 p-4">
        <Button
          onClick={onAdd}
          className="px-4 py-2 mt-4 text-black !border-gray-700 !border-1 rounded  !transition-colors"
        >
          Dodaj učenika
        </Button>

        <MyInput
          className="!w-1/2 min-w-[300px]"
          placeholder="Pretraži studenta po imenu i prezimenu"
          value={searchValue}
          name="search"
          onInput={onSearchChange}
          contentBefore={<Search24Regular />}
        />
        <DatePickerMy
          value={selectedDate}
          onDateChange={onDateChange}
        ></DatePickerMy>
        {!isSchoolManager ? (
          <ColorToggleCheckbox
            id="prikaziObojeneRedove"
            label="Obojen prikaz za školarinu"
            onChange={onToggleColor}
            checked={coloredRows}
          />
        ) : (
          ""
        )}

        {!isSchoolManager ? (
          <ColorToggleCheckbox
            id="prikaziObojeneRedoveZaMenadzera"
            label="Obojen prikaz za menadžera"
            onChange={onToggleManagerColor}
            checked={coloredManagerRows}
          />
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
