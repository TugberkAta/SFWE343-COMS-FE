import AdminDashboardPage from "@/app/(adminPanel)/admin/dashboard/page";
import AdminLayout from "@/app/(adminPanel)/admin/layout";
import AdminPage from "@/app/(adminPanel)/admin/page";
import { Navigate, Route, Routes } from "react-router-dom";


export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<AdminPage />} />

      {/* Admin Panel - General Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboardPage />} />
      </Route>
      <Route path="/settings" element={<AdminLayout />}>
        <Route path="account" element={<></>} />
      </Route>
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/admin" />} />
    </Routes>
  );
};
