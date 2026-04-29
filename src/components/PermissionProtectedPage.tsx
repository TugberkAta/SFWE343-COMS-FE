import { AlertCircle } from "lucide-react";

type PermissionProtectedPageProps = {
  message?: string;
};

export const PermissionProtectedPage = ({
  message = "You do not have permission to view this page.",
}: PermissionProtectedPageProps) => {
  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
};
