import AdminDashboardPage from "@/app/(adminPanel)/admin/dashboard/page";
import AdminLayout from "@/app/(adminPanel)/admin/layout";
import AdminPage from "@/app/(adminPanel)/admin/page";
import SettingsAccountPage from "@/app/(adminPanel)/admin/settings/account/page";
import SettingsLayout from "@/app/(adminPanel)/admin/settings/layout";
import SignInPage from "@/app/(auth)/signin/page";
import EmailAuthPage from "@/app/(auth)/email-auth/page";
import LoginPage from "@/app/(auth)/login/page";
import PendingUsersPage from "@/app/(adminPanel)/pending-users/page";
import { Navigate, Route, Routes } from "react-router-dom";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/email-auth" element={<EmailAuthPage />} />
      <Route path="/pending-users" element={<PendingUsersPage />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />

        <Route path="settings" element={<SettingsLayout />}>
          <Route path="account" element={<SettingsAccountPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};