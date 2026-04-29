import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { FacultyProgramCard } from "@/components/FacultyProgramCard";
import { Input } from "@/components/ui/input";
import { useBreadcrumb } from "@/contexts/breadcrumb-context";
import useFetchData from "@/hooks/use-fetch-data";
import { getCourses, type Course } from "@/services/courses";
import { getPrograms, type Program } from "@/services/programs";
import { usePermission } from "@/hooks/use-permission";
import { ENDPOINT_PERMISSIONS } from "@/constants/permissions";
import { PermissionProtectedPage } from "@/components/PermissionProtectedPage";

const topVariants = [
  "bg-[#232323]",
  "bg-[#1f1f1f]",
  "bg-[#262626]",
  "bg-[#202020]",
];

const CoursesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setBreadcrumbItem } = useBreadcrumb();
  const { hasPermission } = usePermission();
  const [search, setSearch] = useState("");

  const [coursesLoading, coursesError, coursesData] = useFetchData(getCourses);
  const [programsLoading, programsError, programsData] = useFetchData(getPrograms);

  const courses: Course[] = coursesData.courses || [];
  const programs: Program[] = programsData.programs || [];

  const departmentId = Number(searchParams.get("departmentId"));
  const programId = Number(searchParams.get("programId"));
  const normalizedSearch = search.trim().toLowerCase();

  const selectedProgram = useMemo(
    () => programs.find((program) => program.programId === programId),
    [programId, programs]
  );

  const filteredCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          course.programId === programId &&
          course.departmentId === departmentId &&
          (!normalizedSearch ||
            course.name.toLowerCase().includes(normalizedSearch) ||
            course.code.toLowerCase().includes(normalizedSearch) ||
            course.language.toLowerCase().includes(normalizedSearch))
      ),
    [courses, departmentId, normalizedSearch, programId]
  );

  useEffect(() => {
    setBreadcrumbItem("/admin/courses", "Programs > Courses");
  }, [setBreadcrumbItem]);

  // 🔥 PAGE PROTECTION
  if (!hasPermission(ENDPOINT_PERMISSIONS.courses.READ)) {
    return <PermissionProtectedPage />;
  }

  if (coursesLoading || programsLoading) {
    return <div className="p-6 text-white">Loading courses...</div>;
  }

  if (coursesError || programsError) {
    return <div className="p-6 text-red-400">Error loading courses.</div>;
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Courses</h1>
        <p className="mt-2 text-lg text-white/65">
          {selectedProgram
            ? `Select a course in ${selectedProgram.name}.`
            : "Select a course."}
        </p>
      </div>

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search courses..."
        className="max-w-md"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 md:grid-cols-2">
        {filteredCourses.map((course, index) => (
          <FacultyProgramCard
            key={course.courseId}
            title={course.name}
            posterTitle={course.code}
            posterSubtitle={course.language.toUpperCase()}
            description={`${course.courseLevelText} • ${course.localCredits} local / ${course.ectsCredits} ECTS`}
            ctaLabel="View outlines"
            topClassName={topVariants[index % topVariants.length]}
            onClick={() =>
              navigate(
                `/admin/teacher-outlines?departmentId=${departmentId}&programId=${programId}&courseId=${course.courseId}`
              )
            }
          />
        ))}
      </div>

      {!filteredCourses.length ? (
        <p className="text-sm text-white/65">No courses match your search.</p>
      ) : null}
    </div>
  );
};

export default CoursesPage;