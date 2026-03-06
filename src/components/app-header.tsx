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

export function PageHeader() {
  const location = useLocation();
  const { breadcrumbData } = useBreadcrumb();
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
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1 text-foreground" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <Fragment key={item.url}>
                <BreadcrumbItem>
                  {index === breadcrumbItems.length - 1 ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : item.isValid ? (
                    <BreadcrumbLink asChild>
                      <Link to={`${item.url}${breadcrumbData.searchParams[item.url] || ''}`}>{item.label}</Link>
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
    </header>
  );
}
