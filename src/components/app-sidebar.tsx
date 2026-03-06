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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const pathname = location.pathname;

  const isSettingsSection = pathname.includes("/settings");

  const mainTabs = getMainNavigation();
  const settingsTabs = getSettingsNavigation();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="h-auto py-3 hover:bg-(--sidebar-logo-bg) data-[state=open]:bg-(--sidebar-logo-bg)"
            >
              <Link to="/dashboard">
                <div className="flex flex-col items-center justify-center w-full">
                  <SettingsIcon />
                  <span className="text-sm font-semibold">Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="border-b border-sidebar-border mx-2 mt-2" />
      </SidebarHeader>
      <SidebarContent>
        {isSettingsSection ? (
          <NavMain items={settingsTabs} />
        ) : (
          <NavMain items={mainTabs} />
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
      <div className="border-b border-sidebar-border mx-2 mt-2" />
      <SidebarFooter>
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
