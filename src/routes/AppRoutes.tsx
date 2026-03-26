import AdminDashboardPage from "@/app/(adminPanel)/admin/dashboard/page";
import AdminLayout from "@/app/(adminPanel)/admin/layout";
import AdminPage from "@/app/(adminPanel)/admin/page";
import SignInPage from "@/app/(auth)/signin/page";
import { Navigate, Route, Routes } from "react-router-dom";
import EmailAuthPage from "@/app/(auth)/email-auth/page";
import LoginPage from "@/app/(auth)/login/page";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/email-auth" element={<EmailAuthPage />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
      </Route>
      <Route path="/settings" element={<AdminLayout />}>
        <Route path="account" element={<></>} />
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};
