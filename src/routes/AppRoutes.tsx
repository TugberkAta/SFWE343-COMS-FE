import AdminLayout from "@/app/(adminPanel)/admin/layout";
import SettingsAccountPage from "@/app/(adminPanel)/admin/settings/account/page";
import SignInPage from "@/app/(auth)/signin/page";
import EmailAuthPage from "@/app/(auth)/email-auth/page";
import LoginPage from "@/app/(auth)/login/page";
import { Navigate, Route, Routes } from "react-router-dom";
import PendingUsersPage from "@/app/(adminPanel)/pending-users/page";
import UsersWithRolePage from "@/app/(adminPanel)/users-with-role/page";
import UserTypesPage from "@/app/(adminPanel)/user-types/page";
import TeacherOutlinesPage from "@/app/(adminPanel)/teacher-outlines/page";
import FacultiesPage from "@/app/(adminPanel)/faculties/page";
import ProgramsPage from "@/app/(adminPanel)/programs/page";
import CoursesPage from "@/app/(adminPanel)/courses/page";
import TeacherOutlineDetailsPage from "@/app/(adminPanel)/teacher-outlines/details/page";
import { paths } from "@/utils/paths";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route
        path="/pending-users"
        element={<Navigate to={paths.admin.pendingUsers} replace />}
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/email-auth" element={<EmailAuthPage />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<FacultiesPage />} />
        <Route path="teacher-outlines" element={<TeacherOutlinesPage />} />
        <Route path="teacher-outlines/:outlineId" element={<TeacherOutlineDetailsPage />} />
        <Route path="faculties" element={<FacultiesPage />} />
        <Route path="programs" element={<ProgramsPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="pending-users" element={<PendingUsersPage />} />
        <Route path="user-types" element={<UserTypesPage />} />
        <Route path="users-with-role" element={<UsersWithRolePage />} />
        <Route path="settings/account" element={<SettingsAccountPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};