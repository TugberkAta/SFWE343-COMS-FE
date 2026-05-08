import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { getMainNavigation, getSettingsNavigation } from "@/config/navigation";
import { SettingsIcon } from "lucide-react";
import { NavSecondary } from "./nav-secondary";
import { secondaryNavigation } from "@/config/navigation";
import { settingsSecondaryNavigation } from "@/config/navigation";
import { usePermission } from "@/hooks/use-permission";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const pathname = location.pathname;

  const { hasPermission } = usePermission();

  const isSettingsSection = pathname.includes("/settings");

  const mainTabs = getMainNavigation();
  const settingsTabs = getSettingsNavigation();

  const filteredMainTabs = mainTabs.filter((item) => {
    if (item.permission) {
      return hasPermission(item.permission);
    }
    return true;
  });

  return (
    <Sidebar variant="inset" {...props} className="bg-white border-r border-[#e5e7eb]">
      <SidebarHeader className="bg-white border-b border-[#e5e7eb]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="h-auto py-3 hover:bg-[#f8f8f8] data-[state=open]:bg-[#f8f8f8]"
            >
              <Link to="/admin">
                <div className="flex flex-col items-center justify-center w-full">
                  <SettingsIcon className="text-[#ef233c]" />
                  <span className="text-sm font-semibold text-[#111827]">Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="border-b border-[#e5e7eb] mx-2 mt-2" />
      </SidebarHeader>

      <SidebarContent className="bg-white">
        {isSettingsSection ? (
          <NavMain items={settingsTabs} />
        ) : (
          <NavMain items={filteredMainTabs} />
        )}

        {isSettingsSection ? (
          <NavSecondary
            items={settingsSecondaryNavigation}
            className="mt-auto"
          />
        ) : (
          <NavSecondary items={secondaryNavigation} className="mt-auto" />
        )}
      </SidebarContent>

      <div className="border-b border-[#e5e7eb] mx-2 mt-2" />

      <SidebarFooter className="bg-white border-t border-[#e5e7eb]">
        <NavUser
          user={{
            name: "John Doe",
            email: "john.doe@example.com",
            avatar: "https://github.com/shadcn.png",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}