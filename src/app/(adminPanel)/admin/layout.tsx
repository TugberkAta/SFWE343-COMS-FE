import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { PageHeader } from "@/components/app-header";
import { Outlet } from "react-router-dom";
import { BreadcrumbProvider } from "@/contexts/breadcrumb-context";

export default function AdminLayout() {
  return (
    <BreadcrumbProvider>
      <SidebarProvider className="app-sidebar">
        <AppSidebar />
        <SidebarInset>
          <PageHeader />
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </BreadcrumbProvider>
  );
}
