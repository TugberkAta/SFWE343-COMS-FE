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
                <SidebarMenuButton 
                  asChild 
                  tooltip={item.title}
                  className={isItemActive ? "bg-[#ef233c] text-white hover:bg-[#e60012]" : "text-[#374151] dark:text-[#888] hover:bg-[#fff1f2] dark:hover:bg-[#2a2a2a] hover:text-[#ef233c]"}
                >
                  {item.items?.length ? (
                    <CollapsibleTrigger asChild>
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
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  )}
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className={isItemActive ? "text-white" : "text-[#374151] dark:text-[#888]"}>
                        <ChevronRight className={isItemActive ? "text-white" : "text-[#374151] dark:text-[#888]"} />
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
                              className={subItem.url === pathname ? "bg-[#ef233c] text-white hover:bg-[#e60012]" : "text-[#374151] dark:text-[#888] hover:bg-[#fff1f2] dark:hover:bg-[#2a2a2a] hover:text-[#ef233c]"}
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
