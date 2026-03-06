/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BreadcrumbRules {
    skip?: boolean;
    replace?: string;
  }
  
  export interface BreadcrumbData {
    labels: Record<string, string>;
    rules: Record<string, BreadcrumbRules>;
    searchParams: Record<string, string>;
  }
  
  export interface BreadcrumbContextType {
    breadcrumbData: BreadcrumbData;
    setBreadcrumbItem: (path: string, label: string, searchParams?: string) => void;
    removeBreadcrumbItem: (path: string) => void;
    setBreadcrumbRules: (rules: Record<string, BreadcrumbRules>) => void;
    clearBreadcrumbData: () => void;
  }
  
  export interface CustomizeOptions {
    path?: string;
    label?: string;
    rules?: Record<string, BreadcrumbRules>;
    deps?: any[];
  }
  