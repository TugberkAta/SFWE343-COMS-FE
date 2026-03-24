import AdminDashboardPage from "@/app/(adminPanel)/admin/dashboard/page";
import AdminLayout from "@/app/(adminPanel)/admin/layout";
import AdminPage from "@/app/(adminPanel)/admin/page";
import AdminSignInPage from "@/app/(auth)/login/page";
import EmailSignupPage from "@/app/(auth)/signup/page";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/sign-in" element={<AdminSignInPage />} />
      <Route path="/signup" element={<EmailSignupPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
        </Route>
        <Route path="/settings" element={<AdminLayout />}>
          <Route path="account" element={<></>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};