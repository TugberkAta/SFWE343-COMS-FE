import { Navigate } from "react-router-dom";
import { paths } from "@/utils/paths";

export default function AdminPage() {
  return <Navigate to={paths.admin.pendingUsers} replace />;
}
