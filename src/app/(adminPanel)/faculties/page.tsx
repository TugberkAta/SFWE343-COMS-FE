import { useNavigate } from "react-router-dom";
import { FacultyProgramCard } from "@/components/FacultyProgramCard";
import { useBreadcrumb } from "@/contexts/breadcrumb-context";
import { useEffect, useMemo, useState } from "react";
import useFetchData from "@/hooks/use-fetch-data";
import {
  getDepartments,
  type Department,
} from "@/services/departments";
import { Input } from "@/components/ui/input";
import { usePermission } from "@/hooks/use-permission";
import { ENDPOINT_PERMISSIONS } from "@/constants/permissions";
import { PermissionProtectedPage } from "@/components/PermissionProtectedPage";

const topVariants = [
  "bg-[#232323]",
  "bg-[#1f1f1f]",
  "bg-[#262626]",
  "bg-[#202020]",
];

const FacultiesPage = () => {
  const navigate = useNavigate();
  const { setBreadcrumbItem } = useBreadcrumb();
  const { hasPermission } = usePermission();
  const [search, setSearch] = useState("");
  const [loading, error, data] = useFetchData(getDepartments);

  const departments: Department[] = data.departments || [];
  const normalizedSearch = search.trim().toLowerCase();

  const filteredDepartments = useMemo(
    () =>
      departments.filter((department) => {
        if (!normalizedSearch) return true;

        return (
          department.name.toLowerCase().includes(normalizedSearch) ||
          department.type.toLowerCase().includes(normalizedSearch)
        );
      }),
    [departments, normalizedSearch]
  );

  useEffect(() => {
    setBreadcrumbItem("/admin", "Faculties");
  }, [setBreadcrumbItem]);

  // 🔥 PAGE PROTECTION
  if (!hasPermission(ENDPOINT_PERMISSIONS.departments.READ)) {
    return <PermissionProtectedPage />;
  }

  if (loading) return <div className="p-6 text-white">Loading faculties...</div>;
  if (error) return <div className="p-6 text-red-400">Error loading faculties.</div>;

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Faculties
        </h1>
        <p className="mt-2 text-lg text-white/65">
          Select a faculty to view programs.
        </p>
      </div>

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search faculties..."
        className="max-w-md"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 md:grid-cols-2">
        {filteredDepartments.map((department, index) => (
          <FacultyProgramCard
            key={department.departmentId}
            title={department.name}
            posterTitle={department.name}
            posterSubtitle={department.type.toUpperCase()}
            description="Browse all programs offered by this faculty."
            ctaLabel="View programs"
            topClassName={topVariants[index % topVariants.length]}
            onClick={() =>
              navigate(`/admin/programs?departmentId=${department.departmentId}`)
            }
          />
        ))}
      </div>

      {!filteredDepartments.length ? (
        <p className="text-sm text-white/65">No faculties match your search.</p>
      ) : null}
    </div>
  );
};

export default FacultiesPage;