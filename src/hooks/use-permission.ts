import { useCallback, useMemo } from "react";
import Authentication from "@/services/auth/authentication";

export const usePermission = () => {
  const auth = useMemo(() => new Authentication(), []);

  const hasPermission = useCallback(
    (permission: string) => {
      const user = auth.getCurrentUser();
      return user?.permissions.includes(permission) ?? false;
    },
    [auth]
  );

  return { hasPermission };
};
