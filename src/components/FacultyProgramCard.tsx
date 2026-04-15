import { cn } from "@/lib/utils";

type FacultyProgramCardProps = {
  title: string;
  posterTitle?: string;
  posterSubtitle?: string;
  topClassName?: string;
  onClick?: () => void;
};

export const FacultyProgramCard = ({
  title,
  posterTitle,
  posterSubtitle,
  topClassName,
  onClick,
}: FacultyProgramCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full overflow-hidden rounded-[24px] border border-white/10 bg-[#111111] text-left shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-all duration-200 hover:-translate-y-1 hover:border-white/20",
      )}
    >
      <div
        className={cn(
          "relative flex h-[250px] items-center justify-center",
          topClassName ?? "bg-[#1b1b1b]"
        )}
      >
        <div className="absolute left-1/2 top-1/2 h-[178px] w-[178px] -translate-x-[calc(50%-14px)] -translate-y-[calc(50%-14px)] bg-white" />

        <div className="relative z-10 flex aspect-square w-[178px] items-center justify-center border-[6px] border-black bg-[#f7f7f7]">
          <div className="px-3 text-center text-black">
            {posterTitle ? (
              <div className="text-[18px] font-semibold leading-[1.15]">
                {posterTitle}
              </div>
            ) : null}

            {posterSubtitle ? (
              <div className="mt-3 text-[15px] font-semibold leading-[1.2]">
                {posterSubtitle}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="min-h-[138px] bg-[#151515] px-5 py-6">
        <h3 className="text-[20px] font-semibold leading-[1.35] text-white">
          {title}
        </h3>
      </div>
    </button>
  );
};