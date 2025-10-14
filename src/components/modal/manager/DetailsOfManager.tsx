import toast from "react-hot-toast";
import api from "../../../api";
import { useEffect, useState } from "react";
import { Spinner } from "@fluentui/react-components";
import { Pagination } from "../../ui/Pagination";
import { MyInput } from "../../ui/MyInput";
import { Search24Regular } from "@fluentui/react-icons/fonts";

export default function DetailsOfManager({ id }) {
  const [students, setStudents] = useState(null);
  const [manager, setManager] = useState(null);
  const [numberOfSchools, setNumberOfSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  useEffect(() => {
    fetchStudentsOfManager();
  }, [page, limit, debouncedSearchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchStudentsOfManager = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/menadzeri/${id}`, {
        params: { page, limit, search },
      });
      setStudents(response.data.students);
      setTotalPages(response.data.pagination.totalPages);
      setNumberOfSchools(response.data.numberOfSchools);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const setCurrPage = (page: number) => {
    setPage(page);
  };



  return (
    <>
      <MyInput
        value={search}
        onChange={(e: any) => setSearch(e.target.value)}
        placeholder="Pretraži studente..."
        contentBefore={<Search24Regular />}
        className="!w-full mb-5 mt-3 min-w-[300px]"
      />
      <div className="my-5">
        <ul>
          {numberOfSchools.map((school : any)=>{
            return (
              <li className="text-xl"><strong>{school.school}:</strong> {school.numberStudents}</li>
            )
          })}
        </ul>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
        {loading ? (
        <div className="h-[400px]">
          <Spinner className="mt-5"></Spinner>
        </div>
      ) : students?.length === 0 ? (
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-gray-500 text-lg">
            {search ? "Nema studenata koji odgovaraju pretrazi." : "Nema studenata."}
          </p>
        </div>
      ) : (
        <table className="min-w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Učenik
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Škola
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Zanimanje
              </th>
            </tr>
          </thead>
          <tbody>
            {students?.map((ucenik: any) => {
              return (
                <tr key={ucenik.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{ucenik.imeIPrezime}</td>
                  <td className="px-4 py-3">{ucenik.skola}</td>
                  <td className="px-4 py-3">{ucenik.zanimanje}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        goToPage={setCurrPage}
      ></Pagination>
    </>
  );
}
