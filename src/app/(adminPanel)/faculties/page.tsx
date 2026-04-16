import { useNavigate } from "react-router-dom";
import { FacultyProgramCard } from "@/components/FacultyProgramCard";
import { useBreadcrumb } from "@/contexts/breadcrumb-context";
import { useEffect } from "react";
import useFetchData from "@/hooks/use-fetch-data";
import {
  getDepartments,
  type Department,
} from "@/services/departments";

const topVariants = [
  "bg-[#232323]",
  "bg-[#1f1f1f]",
  "bg-[#262626]",
  "bg-[#202020]",
];

const FacultiesPage = () => {
  const navigate = useNavigate();
  const { setBreadcrumbItem } = useBreadcrumb();
  const [loading, error, data] =
    useFetchData(getDepartments);

  const departments: Department[] = data.departments || [];

  useEffect(() => {
    setBreadcrumbItem("/admin", "Faculties");
  }, [setBreadcrumbItem]);

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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 md:grid-cols-2">
        {departments.map((department, index) => (
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
    </div>
  );
};

export default FacultiesPage;