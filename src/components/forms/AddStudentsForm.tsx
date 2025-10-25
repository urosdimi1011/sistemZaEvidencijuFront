import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { MyInput } from "../ui/MyInput";
import * as yup from "yup";
import { useForm, Resolver, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import MyDropdown from "../ui/MyDropdown";
import Select from "react-select";
import toast from "react-hot-toast";
import { StringDecoder } from "string_decoder";
import api from "../../api";
import OccupationDropdown from "../ui/OccupationDropdown";
import { useAuth } from "../../Provides/AuthProvider";
import {
  Checkbox,
  Field,
  Radio,
  RadioGroup,
  Textarea,
} from "@fluentui/react-components";
import Modal from "../modal/Modal";
import ConfirmManagerChangeModal from "../modal/manager/ConfirmManagerChangeModal";

interface Student {
  id?: number;
  ime: string;
  prezime: string;
  imeRoditelja: string;
  zanimanje: number;
  managerId: number | null;
  cenaSkolarine: number;
  desc: string | null;
  note: string | null;
  literature: string | null;
  type: string;
  entry_type: string;
  createdAt: string;
  procenatManagera: number | null; // 👈 Procenat može biti null
  schoolId: number;
}

interface AddStudentFormProps {
  onSuccess?: (noviStudent: Student) => void;
  student?: Student;
}

interface Option {
  value: number | null;
  label: string;
}

interface OptionWithLabel {
  label: string;
  options: {
    value: string;
    label: string;
  };
}

export default function AddStudentsForm({
  onSuccess,
  student,
}: AddStudentFormProps) {
  const [loading, setLoading] = useState(false);
  const [menadzeri, setMenadzeri] = useState<Option[]>([]);
  const [zanimanja, setZanimanja] = useState<OptionWithLabel[]>([]);
  const [skole, setSkole] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [managerSelected, setManagerSelected] = useState<boolean>(false);
  const [schoolSelected, setSchoolSelected] = useState<boolean>(false);
  const [schoolSelect, setSchoolSelecte] = useState<number | null>(null);
  const { currentUser } = useAuth();
  const isSchoolManager = currentUser?.role === "school_manager";

  const counter = useRef(0);
  const counterMounted = useRef(0);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [pendingValues, setPendingValues] = useState(null);

  const handleCancel = () => {
    setShowConfirmModal(false);
    setPendingValues(null);
    setConfirmationData(null);
  };
  const schema = yup.object({
    ime: yup
      .string()
      .trim()
      .max(255, "Ime ne sme biti duže od 255 karaktera")
      .min(2, "Ime mora imati vise od 2 karaktera"),
    prezime: yup
      .string()
      .trim()
      .max(255, "Prezime ne sme biti duže od 255 karaktera")
      .min(2, "Prezime mora imati vise od 2 karaktera"),
    imeRoditelja: yup
      .string()
      .trim()
      .max(255, "Ime roditelja ne sme biti duže od 255 karaktera")
      .min(2, "Ime roditelja mora imati vise od 2 karaktera"),
    zanimanje: yup
      .number()
      .min(1, "Morate izabrati zanimanje")
      .typeError("Morate izabrati zanimanje"),
    managerId: yup.number().nullable(),
    cenaSkolarine: yup.number().required("Cena školarine je obavezno"),
    type: yup.string().required("Morate izabrati tip ucenika"),
    entry_type: yup.string().required("Morate izabrati tip upisa"),
    note: yup.string().nullable(),
    schoolId: yup.string().required(),
    createdAt: yup.string().nullable(),
    literature: yup.boolean().nullable(),
    procenatManagera: yup
      .number()
      .nullable()
      .when("managerId", {
        is: (managerId: number | null) =>
          managerId !== null && managerId !== undefined,
        then: (schema) =>
          schema.required(
            "Procenat menadžera je obavezan kada je menadžer izabran"
          ),
        otherwise: (schema) => schema.nullable(),
      }),
  });
  console.log("KOMPONENTA SE MOUNTUJE",++counterMounted.current);
  const {
    register,
    handleSubmit,
    control,
    reset,
    trigger,
    watch,
    formState: { errors },
  } = useForm<Student>({
    resolver: yupResolver(schema),
    defaultValues:
      student !== undefined
        ? {
            ...student,
            procenatManagera: student?.procenatMenadzeru,
            managerId: student.menadzer?.id || null,
            zanimanje: student.zanimanje?.id,
            literature: student.literature ? true : false,
            schoolId: student.schoolId,
          }
        : {
            ime: "",
            prezime: "",
            imeRoditelja: "",
            zanimanje: null,
            managerId: null,
            cenaSkolarine: null,
            procenatManagera: null,
            createdAt: "",
            type: "",
            entry_type: "",
            note: "",
            schoolId: null,
          },
  });

  const watchManagerId = watch("managerId");
  const watchProcenatManagera = watch("procenatManagera");
  const watchSelektovanaSkola = watch("schoolId");
  useEffect(() => {
    (async () => {
      try {
        await getManagers();
        await getSchools();
        if (student) {
          const hasManager =
            student.menadzer?.id !== null && student.menadzer?.id !== undefined;
          setManagerSelected(
            student.menadzer?.id !== null && student.menadzer?.id !== undefined
          );

          reset({
            ...student,
            procenatManagera: student?.procenatMenadzeru,
            managerId: student.menadzer?.id || null,
            zanimanje: student.zanimanje?.id,
            literature: student.literature ? true : false,
            schoolId: student.schoolId,
          });

          setTimeout(() => {
            if (hasManager) {
              trigger("procenatManagera");
            }
          }, 100);
        }
      } catch (xhr) {
        setError(
          "Greska kod dohvatanja menadzera ili zanimanja: " + xhr.message
        );
      }
    })();
  }, []);
  useEffect(() => {
    const hasManager = watchManagerId !== null && watchManagerId !== undefined;
    setManagerSelected(hasManager);

    if (!hasManager) {
      reset({
        ...watch(),
        procenatManagera: null,
      });
    } else {
      trigger("procenatManagera");
    }
  }, [watchManagerId, reset, trigger]);

  useEffect(() => {
    const hasSchool =
      watchSelektovanaSkola !== null && watchSelektovanaSkola !== undefined;
    setSchoolSelected(hasSchool);
    setSchoolSelecte(watchSelektovanaSkola);
    counter.current++;
    console.log(counter.current,"Oov je u useEffect za hasSchool");

    reset({
        ...watch(),
        zanimanje: 0,
    });
    trigger("zanimanje");
  }, [watchSelektovanaSkola, reset, trigger]);

  useEffect(() => {
    if (managerSelected) {
      trigger("procenatManagera");
    }
  }, [watchProcenatManagera, managerSelected, trigger]);

  useEffect(() => {
    if (schoolSelected) {
      trigger("zanimanje");
      getOccupationsFromSchool();
    }
  }, [watchSelektovanaSkola, schoolSelected]);

  useEffect(() => {
    setManagerSelected(watchManagerId !== null && watchManagerId !== undefined);

    if (watchManagerId === null || watchManagerId === undefined) {
      reset({
        ...watch(),
        procenatManagera: null,
      });
    }
  }, [watchManagerId, reset]);

  const getOccupationsFromSchool = async () => {
    try {
      counter.current++;
      console.log(counter.current,'Ovo je za API poziv',schoolSelect);


      const endpoint = `/schools/${schoolSelect}/occupations`;
      const response = await api.get(endpoint);
      const filteredOccupationsForDropdown = response.data.occupations.map(
        (s: any) => {
          return {
            label: s.name,
            value: s.id,
          };
        }
      );
      setZanimanja(filteredOccupationsForDropdown);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getManagers = async () => {
    const response = await api.get("/menadzeri/dropdown");
    const list = Array.isArray(response.data)
      ? response.data
      : response.data.dropdownData;
    list.unshift({ value: null, label: "Nema menadžera" });
    setMenadzeri(list);
  };

//   const getOccupations = async () => {
//     try {
//       const endpoint =
//         isSchoolManager && userSchoolId
//           ? `/occupations/school/${userSchoolId}`
//           : "/occupations";

//       const response = await api.get(endpoint);
//       const list = response.data;
//       const mapped: OptionWithLabel[] = list.map((m) => ({
//         label: m.name,
//         options: m.occupations.map((s) => ({
//           label: s.name,
//           value: s.id,
//         })),
//       }));
//       setZanimanja(mapped);
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

  const getSchools = async () => {
    try {
      const endpoint = "/schools/all";
      const response = await api.get(endpoint);
      const skole = response.data;
      setSkole(skole);
    } catch (error) {
      toast.error(error.message);
    }
  };


  const handleConfirm = async () => {
    try {
      const response = await api.patch(
        `/students/${student?.id}?confirmDeletePayouts=true`,
        pendingValues
      );
      onSuccess(response.data);
      setShowConfirmModal(false);
      toast.success("Student uspešno ažuriran");
    } catch (error: any) {
      toast.error("Greška pri ažuriranju");
    }
  };
  const onSubmit = async (values: Student) => {
    const valuesForSend = prepareValueForSending(values);
    try {
      let response = null;
      if (student !== undefined) {
        response = await api.patch(`/students/${student.id}`, valuesForSend, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        response = await api.post("/students", valuesForSend, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      onSuccess(response.data);
    } catch (error: any) {
      if (
        error.response?.status === 409 &&
        error.response?.data?.needsConfirmation
      ) {
        setConfirmationData(error.response.data);
        setPendingValues(valuesForSend);
        setShowConfirmModal(true);
        return;
      }
      const errorMessage =
        error.response?.data?.error?.detail ||
        error.detail ||
        `Došlo je do greške prilikom slanja podataka, Poruka(${error.message})`;
      toast.error(errorMessage);
    }
  };

  const prepareValueForSending = (data: Student) => {
    return {
      ime: data.ime,
      prezime: data.prezime,
      occupationId: parseInt(data.zanimanje),
      managerId: data.managerId,
      cenaSkolarine: data.cenaSkolarine,
      imeRoditelja: data.imeRoditelja,
      procenatManagera: data.managerId ? data.procenatManagera : null,
      type: data.type,
      createdAt: data.createdAt ?? null,
      entry_type: data.entry_type,
      literature: data.literature ? 50 : null,
      note: data.note ?? null,
    };
  };

  const getPercentageOptions = () => {
    if (isSchoolManager) {
      return [
        {
          value: 0,
          label: "0%",
        },
        {
          value: 20,
          label: "20%",
          selected: true,
        },
      ];
    }
    return [
      {
        value: 0,
        label: "0%",
      },
      {
        value: 5,
        label: "5%",
      },
      {
        value: 10,
        label: "10%",
      },
      {
        value: 15,
        label: "15%",
      },
      {
        value: 20,
        label: "20%",
        selected: true,
      },
      {
        value: 25,
        label: "25%",
      },
      {
        value: 30,
        label: "30%",
      },
      {
        value: 40,
        label: "40%",
      },
    ];
  };

  return (
    <>
      <form
        key={student?.id || "new-student"}
        onSubmit={handleSubmit(onSubmit)}
      >
        {error && <div className="error text-red-900">{error}</div>}

        <MyInput
          autoFocus
          {...register("ime")}
          control={control}
          label={"Unesite ime ucenika"}
          name={"ime"}
          className="my-1"
        ></MyInput>
        {errors.ime && (
          <div className="text-red-900 text-shadow">{errors.ime.message}</div>
        )}

        <MyInput
          {...register("imeRoditelja")}
          control={control}
          label={"Unesite ime roditelja"}
          name={"imeRoditelja"}
          className="my-1"
        ></MyInput>
        {errors.imeRoditelja && (
          <div className="text-red-900">{errors.imeRoditelja.message}</div>
        )}

        <MyInput
          {...register("prezime")}
          control={control}
          label={"Unesite prezime ucenika"}
          name={"prezime"}
          className="my-1"
        ></MyInput>
        {errors.prezime && (
          <div className="text-red-900">{errors.prezime.message}</div>
        )}

        <Controller
          control={control}
          name="schoolId"
          render={({ field }) => (
            <MyDropdown
              label="Izaberite skolu"
              id="schoolId"
              name="schoolId"
              options={skole}
              value={field.value}
              onChange={(val) => {
                field.onChange(val.value);
                setSchoolSelected(true);
                setSchoolSelecte(val.value);
              }}
              searchable={false}
            />
          )}
        />
        {errors.schoolId && (
          <div className="text-red-900">{errors.schoolId.message}</div>
        )}

        <Controller
          control={control}
          name="zanimanje"
          render={({ field }) => (
            <MyDropdown
              label="Izaberite zanimanje"
              placeHolder={
                schoolSelected
                  ? "Izaberite zanimanje učenika"
                  : "Prvo izaberite školu"
              }
              id="skolaId"
              name="zanimanje"
              options={zanimanja}
              value={field.value}
              disabled={!schoolSelected}
              onChange={(val) => {
                field.onChange(val.value)
                trigger("zanimanje");
            }
            }
              searchable={false}
            />
          )}
        />
        {errors.zanimanje && (
          <div className="text-red-900">{errors.zanimanje.message}</div>
        )}

        <Field label="Učenik se upisuje kao:">
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onChange={(_, data) => field.onChange(data.value)}
              >
                <Radio value="vandredni" label="Vandredni" />
                <Radio value="redovni" label="Redovni" />
              </RadioGroup>
            )}
          />
        </Field>
        {errors.type && (
          <div className="text-red-900">{errors.type.message}</div>
        )}

        <Field label="Izaberite tip upisa za učenika">
          <Controller
            name="entry_type"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onChange={(_, data) => field.onChange(data.value)}
              >
                <Radio value="prekvalifikacija" label="Prekvalifikacija" />
                <Radio value="dokvalifikacija" label="Dokvalifikacija" />
                <Radio value="vanredni" label="Vanredni" />
              </RadioGroup>
            )}
          />
        </Field>
        {errors.entry_type && (
          <div className="text-red-900">{errors.entry_type.message}</div>
        )}

        <MyInput
          type="number"
          {...register("cenaSkolarine")}
          control={control}
          label={"Unesite Cenu skolarine za studenta"}
          name={"cenaSkolarine"}
          className="my-1"
        ></MyInput>
        {errors.cenaSkolarine && (
          <div className="text-red-900">{errors.cenaSkolarine.message}</div>
        )}

        {!isSchoolManager && (
          <MyInput
            {...register("createdAt")}
            type="datetime-local"
            control={control}
            label={"Datum kada je student upisan (opciono)"}
            name={"createdAt"}
          />
        )}

        <Controller
          name="literature"
          control={control}
          render={({ field }) => (
            <Checkbox
              checked={field.value || false}
              onChange={(_, data) => field.onChange(data.checked)}
              label="Da li želi literaturu (50eura)?"
            />
          )}
        />

        {/* NOVO DODAVANJE NAPOMENE ZA STUDENTA */}
        <Field label="Unesite napomenu (opciono)">
          <Textarea placeholder="Unesite napomenu..." {...register("note")} />
        </Field>
        {errors.note && (
          <div className="text-red-900 text-shadow">{errors.note.message}</div>
        )}

        <Controller
          control={control}
          name="managerId"
          render={({ field }) => (
            <MyDropdown
              label="Izaberite menadžera (opciono)"
              id="managerId"
              name="managerId"
              options={menadzeri}
              value={field.value}
              onChange={(val) => field.onChange(val.value)}
              searchable={true}
              maxHeight="default"
              searchPlaceholder="Pretražite menadžere..."
              noOptionsText="Nema menadžera koji odgovaraju pretrazi"
            />
          )}
        />

        <Controller
          control={control}
          name="procenatManagera"
          render={({ field }) => (
            <MyDropdown
              label="Izaberite procenat za menadzera"
              placeHolder={
                managerSelected
                  ? "Izaberite procenat za menadzera"
                  : "Prvo izaberite menadžera"
              }
              name="procenatManagera"
              id="procenatManagera"
              value={field.value}
              disabled={!managerSelected}
              options={getPercentageOptions()}
              onChange={(val) => field.onChange(val.value)}
            />
          )}
        />
        {errors.procenatManagera && (
          <div className="text-red-900">{errors.procenatManagera.message}</div>
        )}

        <button className="mt-10 mb-5" type="submit" disabled={loading}>
          {loading
            ? "Sačekajte..."
            : student !== undefined
            ? "Edituj učenika"
            : "Dodaj učenika"}
        </button>
      </form>
      {showConfirmModal && (
        <Modal isOpen={showConfirmModal} onClose={handleCancel}>
          <ConfirmManagerChangeModal
            data={confirmationData}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </Modal>
      )}
    </>
  );
}
