import { cn } from "@/lib/utils";

type FacultyProgramCardProps = {
  title: string;
  posterTitle?: string;
  posterSubtitle?: string;
  description?: string;
  ctaLabel?: string;
  topClassName?: string;
  onClick?: () => void;
};

export const FacultyProgramCard = ({
  title,
  posterTitle,
  posterSubtitle,
  description,
  ctaLabel,
  topClassName,
  onClick,
}: FacultyProgramCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full h-full flex flex-col overflow-hidden rounded-lg border border-[#e5e7eb] dark:border-[var(--layer-2-border)] bg-white dark:bg-[var(--layer-1)] text-left shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#ef233c]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef233c] dark:focus-visible:ring-[var(--text-main)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[var(--layer-1)]",
      )}
    >
      {/* Minimalist accent bar instead of large top section */}
      <div className="h-1.5 bg-gradient-to-r from-[#ef233c] to-[#e60012]" />

      {/* Content area - clean and simple */}
      <div className="flex-1 flex flex-col p-4">
        <h3 className="text-[16px] font-semibold leading-tight text-[#111827] dark:text-[var(--text-main)] mb-1">
          {title}
        </h3>
        
        {posterSubtitle ? (
          <p className="text-[12px] font-medium text-[#ef233c] dark:text-[var(--text-main)] mb-2 uppercase tracking-wide">
            {posterSubtitle}
          </p>
        ) : null}

        <p className="text-[13px] text-[#6b7280] dark:text-[var(--text-secondary)] line-clamp-2 mb-3">
          {description ?? "Browse programs in this faculty."}
        </p>

        <p className="mt-auto text-[12px] font-medium text-[#ef233c] dark:text-[var(--text-main)] transition-colors group-hover:text-[#e60012] dark:group-hover:text-[var(--text-main)]">
          {ctaLabel ?? "View programs"} <span aria-hidden>→</span>
        </p>
      </div>
    </button>
  );
};