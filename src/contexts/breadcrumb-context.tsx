import {
    createContext,
    useContext,
    type ReactNode,
    useState,
    useCallback,
  } from "react";
  import type {
    BreadcrumbData,
    BreadcrumbContextType,
    BreadcrumbRules,
  } from "@/types/breadcrumbs";
  
  const BreadcrumbContext = createContext<BreadcrumbContextType | null>(null);
  
  export function BreadcrumbProvider({ children }: { children: ReactNode }) {
    const [breadcrumbData, setBreadcrumbData] = useState<BreadcrumbData>({
      labels: {},
      rules: {},
      searchParams: {},
    });
  
    const setBreadcrumbItem = useCallback((path: string, label: string, searchParams?: string) => {
      setBreadcrumbData((prev) => ({
        ...prev,
        labels: { ...prev.labels, [path]: label },
        searchParams: searchParams 
          ? { ...prev.searchParams, [path]: searchParams }
          : prev.searchParams,
      }));
    }, []);
  
    const removeBreadcrumbItem = useCallback((path: string) => {
      setBreadcrumbData((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [path]: _, ...restLabels } = prev.labels;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [path]: __, ...restSearchParams } = prev.searchParams;
        return { 
          ...prev, 
          labels: restLabels,
          searchParams: restSearchParams,
        };
      });
    }, []);
  
    const setBreadcrumbRules = useCallback(
      (rules: Record<string, BreadcrumbRules>) => {
        setBreadcrumbData((prev) => ({
          ...prev,
          rules: { ...prev.rules, ...rules },
        }));
      },
      []
    );
  
    const clearBreadcrumbData = useCallback(() => {
      setBreadcrumbData({ labels: {}, rules: {}, searchParams: {} });
    }, []);
  
    return (
      <BreadcrumbContext.Provider
        value={{
          breadcrumbData,
          setBreadcrumbItem,
          removeBreadcrumbItem,
          setBreadcrumbRules,
          clearBreadcrumbData,
        }}
      >
        {children}
      </BreadcrumbContext.Provider>
    );
  }
  
  // eslint-disable-next-line react-refresh/only-export-components
  export const useBreadcrumb = () => {
    const context = useContext(BreadcrumbContext);
    if (!context) {
      throw new Error("useBreadcrumb must be used within BreadcrumbProvider");
    }
    return context;
  };
  