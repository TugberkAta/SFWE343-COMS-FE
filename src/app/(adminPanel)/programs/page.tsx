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
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/use-permission";
import { ENDPOINT_PERMISSIONS } from "@/constants/permissions";
import { PermissionProtectedPage } from "@/components/PermissionProtectedPage";

const topVariants = [
  "bg-gradient-to-br from-[#ef233c] to-[#e60012]",
  "bg-gradient-to-br from-[#e60012] to-[#ef233c]",
  "bg-gradient-to-br from-[#ef233c] to-[#e60012]",
  "bg-gradient-to-br from-[#e60012] to-[#ef233c]",
];

const ProgramsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setBreadcrumbItem } = useBreadcrumb();
  const { hasPermission } = usePermission();
  const [search, setSearch] = useState("");

  const [departmentsLoading, departmentsError, departmentsData] =
    useFetchData(getDepartments);

  const [programsLoading, programsError, programsData] =
    useFetchData(getPrograms);

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

  // 🔥 PAGE PROTECTION
  if (!hasPermission(ENDPOINT_PERMISSIONS.programs.READ)) {
    return <PermissionProtectedPage />;
  }

  if (departmentsLoading || programsLoading) {
    return <div className="p-6 text-[#111827] dark:text-[var(--text-main)]">Loading programs...</div>;
  }

  if (departmentsError || programsError) {
    return <div className="p-6 text-red-600">Error loading programs.</div>;
  }

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-[var(--layer-0)] min-h-screen">
      <div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="text-[#374151] dark:text-[var(--text-main)]">
            ← Back to Faculties
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#111827] dark:text-[var(--text-main)]">
              Programs
            </h1>
            <p className="mt-2 text-lg text-[#6b7280] dark:text-[var(--text-secondary)]">
              {selectedDepartment
                ? `Select a program in ${selectedDepartment.name}.`
                : "Select a program."}
            </p>
          </div>
        </div>
      </div>

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search programs..."
        className="max-w-md bg-white dark:bg-[var(--layer-2)] border border-[#e5e7eb] rounded-md dark:border-[var(--layer-2-border)] dark:text-[var(--text-main)]"
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
        <p className="text-sm text-[#6b7280]">No programs match your search.</p>
      ) : null}
    </div>
  );
};

export default ProgramsPage;