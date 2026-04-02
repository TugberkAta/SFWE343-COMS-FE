import AdminLayout from "@/app/(adminPanel)/admin/layout";
import AdminPage from "@/app/(adminPanel)/admin/page";
import SignInPage from "@/app/(auth)/signin/page";
import { Navigate, Route, Routes } from "react-router-dom";
import EmailAuthPage from "@/app/(auth)/email-auth/page";
import LoginPage from "@/app/(auth)/login/page";
import PendingUsersPage from "@/app/(adminPanel)/pending-users/page";
import UsersWithRolePage from "@/app/(adminPanel)/users-with-role/page";
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
        <Route index element={<AdminPage />} />
        <Route
          path="dashboard"
          element={<Navigate to={paths.admin.pendingUsers} replace />}
        />
        <Route path="pending-users" element={<PendingUsersPage />} />
        <Route path="users-with-role" element={<UsersWithRolePage />} />
      </Route>
      <Route path="/settings" element={<AdminLayout />}>
        <Route path="account" element={<></>} />
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};
