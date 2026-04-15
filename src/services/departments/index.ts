import http from "@/utils/http";

const mockDepartments = {
  departments: [
    { departmentId: 6, type: "undergraduate", name: "Faculty of Architecture and Fine Arts" },
    { departmentId: 5, type: "undergraduate", name: "Faculty of Arts and Sciences" },
    { departmentId: 8, type: "undergraduate", name: "Faculty of Dentistry" },
    { departmentId: 4, type: "undergraduate", name: "Faculty of Economics and Administrative Sciences" },
    { departmentId: 2, type: "undergraduate", name: "Faculty of Educational Sciences" },
    { departmentId: 3, type: "undergraduate", name: "Faculty of Engineering" },
    { departmentId: 7, type: "undergraduate", name: "Faculty of Health Sciences" },
    { departmentId: 1, type: "undergraduate", name: "Faculty of Law" },
    { departmentId: 9, type: "undergraduate", name: "Faculty of Pharmacy" },
    { departmentId: 10, type: "masters", name: "Institute of Graduate Studies" },
    { departmentId: 11, type: "phd", name: "Institute of Graduate Studies" }
  ]
};

export const getDepartments = () => {
  return Promise.resolve({ data: mockDepartments });
};