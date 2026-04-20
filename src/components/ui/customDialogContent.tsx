import { DialogFooter, DialogHeader, DialogTitle } from "./dialog";

import { DialogClose } from "./dialog";

import { Button } from "./button";
import { DialogContent } from "./dialog";
import { Circle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
export const CustomDialogContent = ({
  children,
  title,
  description,
  currentTab,
  tabs,
  onConfirm,
  bodyClassName,
  wrapperClassName,
  hideTitle = false,
  isSubmitting = false,
  contentClassName,
}: {
  children?: React.ReactNode;
  title?: string;
  description?: React.ReactNode;
  currentTab?: string;
  tabs?: {
    name: string;
    icon: React.ElementType;
    onClick?: () => void;
  }[];
  onConfirm?: () => void;
  bodyClassName?: string;
  wrapperClassName?: string;
  hideTitle?: boolean;
  isSubmitting?: boolean;
  contentClassName?: string;
}) => {
  return (
    <DialogContent
      className={cn(
        "max-w-[88%] h-[88%] p-0 flex gap-0 flex-col",
        contentClassName
      )}
      onInteractOutside={(e) => {
        e.preventDefault();
      }}
    >
      <DialogHeader className="h-[50px] flex justify-center">
        <div className="flex items-center h-full gap-10 ml-2">
          <DialogClose asChild>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon">
                <X className="w-4 h-4 text-subtle" />
              </Button>
              <p className="px-2 rounded-md text-sm">esc</p>
            </div>
          </DialogClose>
          {tabs && (
            <div className="flex items-center h-full overflow-x-auto overflow-y-hidden max-w-[calc(100vw-180px)] scrollbar-thin">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={tab.onClick}
                  className={cn(
                    "flex items-center min-w-[200px] h-full border-x border-gray-200/10 shrink-0",
                    currentTab !== tab.name && "bg-[#18181B]"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-2 ml-4",
                      currentTab !== tab.name && "opacity-50"
                    )}
                  >
                    <Circle
                      className={cn(
                        "w-4 h-4 text-subtle",
                        currentTab === tab.name && "text-blue-400"
                      )}
                    />
                    <p className="text-white text-sm font-bold">{tab.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {title && hideTitle && <span className="ml-auto mr-4">{title}</span>}
        </div>
      </DialogHeader>
      <div
        className={cn(
          "px-6 grow flex-1 flex justify-center",
          wrapperClassName
        )}
      >
        <div className={cn("w-[720px] mt-20", bodyClassName)}>
          <div
            className={cn("w-full flex flex-col gap-2", hideTitle && "sr-only")}
          >
            <DialogTitle className="text-white text-2xl font-bold">
              {title}
            </DialogTitle>
            <div className="text-subtle text-sm mb-8">{description}</div>
          </div>

          {children}
        </div>
      </div>
      {onConfirm && (
        <DialogFooter className="h-[60px]">
          <div className="flex items-center gap-2 mr-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => {}}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </DialogClose>
            {onConfirm && (
              <Button onClick={onConfirm} disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  "Confirm"
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      )}
    </DialogContent>
  );
};
