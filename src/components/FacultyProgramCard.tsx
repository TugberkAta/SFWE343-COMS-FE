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
        "group w-full overflow-hidden rounded-lg border border-[#e5e7eb] bg-white text-left shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#ef233c]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef233c] focus-visible:ring-offset-2",
      )}
    >
      <div
        className={cn(
          "relative flex h-[220px] items-center justify-center bg-gradient-to-br from-[#ef233c] to-[#e60012]",
          topClassName
        )}
      >
        <div className="absolute left-1/2 top-1/2 h-[178px] w-[178px] -translate-x-[calc(50%-14px)] -translate-y-[calc(50%-14px)] bg-white opacity-10" />

        <div className="relative z-10 flex aspect-square w-[178px] items-center justify-center border-[6px] border-white bg-white">
          <div className="px-3 text-center text-[#111827]">
            {posterTitle ? (
              <div className="text-[16px] font-semibold leading-[1.15]">
                {posterTitle}
              </div>
            ) : null}

            {posterSubtitle ? (
              <div className="mt-2 text-[14px] font-semibold leading-[1.2] text-[#ef233c]">
                {posterSubtitle}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="min-h-[138px] bg-white px-5 py-6">
        <h3 className="line-clamp-2 text-[20px] font-semibold leading-tight text-[#111827]">
          {title}
        </h3>
        <p className="mt-2 text-sm text-[#6b7280]">
          {description ?? "Explore related items in this category."}
        </p>
        <p className="mt-4 text-sm font-medium text-[#ef233c] transition-colors group-hover:text-[#e60012]">
          {ctaLabel ?? "View details"} <span aria-hidden>→</span>
        </p>
      </div>
    </button>
  );
};