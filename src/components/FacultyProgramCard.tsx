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
        "group w-full overflow-hidden rounded-[24px] border border-white/10 bg-[#111111] text-left shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_14px_30px_rgba(0,0,0,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f] active:translate-y-0",
      )}
    >
      <div
        className={cn(
          "relative flex h-[220px] items-center justify-center",
          topClassName ?? "bg-[#1b1b1b]"
        )}
      >
        <div className="absolute left-1/2 top-1/2 h-[178px] w-[178px] -translate-x-[calc(50%-14px)] -translate-y-[calc(50%-14px)] bg-white" />

        <div className="relative z-10 flex aspect-square w-[178px] items-center justify-center border-[6px] border-black bg-[#f7f7f7]">
          <div className="px-3 text-center text-black">
            {posterTitle ? (
              <div className="text-[16px] font-semibold leading-[1.15]">
                {posterTitle}
              </div>
            ) : null}

            {posterSubtitle ? (
              <div className="mt-2 text-[14px] font-semibold leading-[1.2]">
                {posterSubtitle}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="min-h-[138px] bg-[#151515] px-5 py-6">
        <h3 className="line-clamp-2 text-[20px] font-semibold leading-tight text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm text-white/65">
          {description ?? "Explore related items in this category."}
        </p>
        <p className="mt-4 text-sm font-medium text-white/90 transition-colors group-hover:text-white">
          {ctaLabel ?? "View details"} <span aria-hidden>→</span>
        </p>
      </div>
    </button>
  );
};