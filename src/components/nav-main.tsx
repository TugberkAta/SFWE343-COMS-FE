import { ChevronRight, type LucideIcon } from "lucide-react";
import { useLocation } from "react-router-dom";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

interface NavMainProps {
  items: {
    title: string;
    url?: string;
    icon?: LucideIcon;
    isActive?: boolean;
    elementLinkId: string;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  label?: string;
}
export function NavMain({ items, label }: NavMainProps) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          // Check if the current item or its subitems match the current pathname
          const isItemActive =
            item.url === pathname ||
            item.items?.some((subItem) => subItem.url === pathname);

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isItemActive || item.isActive}
            >
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={item.title}>
                  {item.items?.length ? (
                    <CollapsibleTrigger asChild className="text-sidebar-foreground/70">
                      <Link
                        to={item.url ?? "#"}
                        id={item.elementLinkId}
                        data-active={
                          item.url === pathname ||
                          item.items?.some((subItem) => subItem.url === pathname)
                        }
                        className="flex items-center gap-2"
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </CollapsibleTrigger>
                  ) : (
                    <Link
                      to={item.url ?? "#"}
                      id={item.elementLinkId}
                      data-active={item.url === pathname}
                      className="text-sidebar-foreground/70"
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  )}
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight className="text-sidebar-foreground/70" />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              data-active={subItem.url === pathname}
                              className="text-sidebar-foreground/70"
                            >
                              <Link to={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
