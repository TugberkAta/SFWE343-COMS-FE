import { usePermission } from "@/hooks/use-permission";

type PermissionGateProps = {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export const PermissionGate = ({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) => {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};