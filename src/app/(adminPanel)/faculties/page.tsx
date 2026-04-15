import { useNavigate } from "react-router-dom";
import { FacultyProgramCard } from "@/components/FacultyProgramCard";
import { useBreadcrumb } from "@/contexts/breadcrumb-context";
import { useEffect } from "react";

const departments = [
  {
    departmentId: 6,
    type: "undergraduate",
    name: "Faculty of Architecture and Fine Arts",
  },
  {
    departmentId: 5,
    type: "undergraduate",
    name: "Faculty of Arts and Sciences",
  },
  {
    departmentId: 8,
    type: "undergraduate",
    name: "Faculty of Dentistry",
  },
  {
    departmentId: 4,
    type: "undergraduate",
    name: "Faculty of Economics and Administrative Sciences",
  },
  {
    departmentId: 2,
    type: "undergraduate",
    name: "Faculty of Educational Sciences",
  },
  {
    departmentId: 3,
    type: "undergraduate",
    name: "Faculty of Engineering",
  },
  {
    departmentId: 7,
    type: "undergraduate",
    name: "Faculty of Health Sciences",
  },
  {
    departmentId: 1,
    type: "undergraduate",
    name: "Faculty of Law",
  },
  {
    departmentId: 9,
    type: "undergraduate",
    name: "Faculty of Pharmacy",
  },
  {
    departmentId: 10,
    type: "masters",
    name: "Institute of Graduate Studies",
  },
  {
    departmentId: 11,
    type: "phd",
    name: "Institute of Graduate Studies",
  },
];

const topVariants = [
  "bg-[#232323]",
  "bg-[#1f1f1f]",
  "bg-[#262626]",
  "bg-[#202020]",
];

const FacultiesPage = () => {
  const navigate = useNavigate();
  const { setBreadcrumbItem } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbItem("/admin", "Faculties");
  }, [setBreadcrumbItem]);

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
            posterTitle="Faculty"
            posterSubtitle={String(index + 1)}
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