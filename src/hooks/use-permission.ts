import { useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";

export default function usePermission() {
  const { permissions } = useAuth();

  const hasPermission = useMemo(
    () => (permission: string) => {
      if (!permissions || !permissions.length) return false;
      return permissions.includes(permission);
    },
    [permissions],
  );

  return { hasPermission };
}
