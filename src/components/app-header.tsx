import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { capitalize } from "@/utils/capitalize";
import { useBreadcrumb } from "@/contexts/breadcrumb-context";
import { isValidRoute } from "@/constants/routes";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageHeader() {
  const location = useLocation();
  const { breadcrumbData } = useBreadcrumb();
  const { theme, setTheme } = useTheme();
  const pathname = location.pathname;

  const pathSegments = pathname.split("/").filter(Boolean);

  const breadcrumbItems = useMemo(() => {
    return pathSegments.reduce(
      (acc, segment, index) => {
        const url = `/${pathSegments.slice(0, index + 1).join("/")}`;
        const rules = breadcrumbData.rules[segment];
        const customLabel = breadcrumbData.labels[url];

        // Skip segments explicitly
        if (rules?.skip) return acc;

        // Handle numeric segments (IDs)
        const isNumeric = /^\d+$/.test(segment);
        if (isNumeric) {
          const label = customLabel || segment;
          acc.push({ url, label, isValid: true });
          return acc;
        }

        // Default label: use custom > replace > capitalized
        const defaultLabel = segment
          .replace(/-/g, " ")
          .split(" ")
          .map(capitalize)
          .join(" ");

        const label = customLabel || rules?.replace || defaultLabel;

        acc.push({
          url,
          label,
          isValid: isValidRoute(url),
        });

        return acc;
      },
      [] as Array<{ url: string; label: string; isValid: boolean }>
    );
  }, [pathSegments, breadcrumbData.rules, breadcrumbData.labels]);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 bg-white dark:bg-[#1a1a1a] border-b border-[#e5e7eb] dark:border-[#333]">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1 text-[#111827] dark:text-white" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4 bg-[#e5e7eb] dark:bg-[#333]"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <Fragment key={item.url}>
                <BreadcrumbItem>
                  {index === breadcrumbItems.length - 1 ? (
                    <BreadcrumbPage className="text-[#111827] dark:text-white">{item.label}</BreadcrumbPage>
                  ) : item.isValid ? (
                    <BreadcrumbLink asChild>
                      <Link to={`${item.url}${breadcrumbData.searchParams[item.url] || ''}`} className="text-[#ef233c] hover:text-[#e60012] dark:text-[#ef233c] dark:hover:text-[#e60012]">{item.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <span className="text-muted-foreground cursor-default">
                      {item.label}
                    </span>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-gray-600" />
          )}
        </Button>
      </div>
    </header>
  );
}
