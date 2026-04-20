import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FacultyProgramCard } from "@/components/FacultyProgramCard";
import { useBreadcrumb } from "@/contexts/breadcrumb-context";
import { useEffect } from "react";
import useFetchData from "@/hooks/use-fetch-data";
import {
  getDepartments,
  type Department,
} from "@/services/departments";
import { getPrograms, type Program } from "@/services/programs";
import { Input } from "@/components/ui/input";

const topVariants = [
  "bg-[#232323]",
  "bg-[#1f1f1f]",
  "bg-[#262626]",
  "bg-[#202020]",
];

const ProgramsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setBreadcrumbItem } = useBreadcrumb();
  const [search, setSearch] = useState("");
  const [departmentsLoading, departmentsError, departmentsData] =
    useFetchData(getDepartments);
  const [programsLoading, programsError, programsData] = useFetchData(getPrograms);

  const departments: Department[] = departmentsData.departments || [];
  const programs: Program[] = programsData.programs || [];

  const departmentId = Number(searchParams.get("departmentId"));
  const normalizedSearch = search.trim().toLowerCase();

  const selectedDepartment = useMemo(
    () =>
      departments.find((department) => department.departmentId === departmentId),
    [departmentId, departments]
  );

  const filteredPrograms = useMemo(
    () =>
      programs.filter((program) => {
        if (program.departmentId !== departmentId) return false;
        if (!normalizedSearch) return true;

        return (
          program.name.toLowerCase().includes(normalizedSearch) ||
          program.language.toLowerCase().includes(normalizedSearch)
        );
      }),
    [departmentId, normalizedSearch, programs]
  );

  useEffect(() => {
    setBreadcrumbItem("/admin/programs", "Faculties > Programs");
  }, [setBreadcrumbItem]);

  if (departmentsLoading || programsLoading) {
    return <div className="p-6 text-white">Loading programs...</div>;
  }

  if (departmentsError || programsError) {
    return <div className="p-6 text-red-400">Error loading programs.</div>;
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Programs
        </h1>
        <p className="mt-2 text-lg text-white/65">
          {selectedDepartment
            ? `Select a program in ${selectedDepartment.name}.`
            : "Select a program."}
        </p>
      </div>

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search programs..."
        className="max-w-md"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 md:grid-cols-2">
        {filteredPrograms.map((program, index) => (
          <FacultyProgramCard
            key={program.programId}
            title={program.name}
            posterTitle={program.name}
            description={`${program.language} program`}
            ctaLabel="View courses"
            topClassName={topVariants[index % topVariants.length]}
            onClick={() =>
              navigate(
                `/admin/courses?departmentId=${departmentId}&programId=${program.programId}`
              )
            }
          />
        ))}
      </div>

      {!filteredPrograms.length ? (
        <p className="text-sm text-white/65">No programs match your search.</p>
      ) : null}
    </div>
  );
};

export default ProgramsPage;