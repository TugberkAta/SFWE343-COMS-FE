import {
  formatOutlineStatusLabel,
  getOutlineDisplayStatus,
} from "@/constants/outlines";

type OutlineStatusBadgeProps = {
  status: string;
  currentStage?: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  pending: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  in_review: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  submitted: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  stage_1_review: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  stage_2_approval: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  changes_requested:
    "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  rejected: "bg-red-500/10 text-red-400 border border-red-500/20",
  approved: "bg-green-500/10 text-green-400 border border-green-500/20",
  published: "bg-green-500/10 text-green-400 border border-green-500/20",
};

const DEFAULT_STYLE =
  "bg-muted/50 text-muted-foreground border border-white/10";

export default function OutlineStatusBadge({
  status,
  currentStage,
}: OutlineStatusBadgeProps) {
  const displayStatus = getOutlineDisplayStatus({ status, currentStage });

  if (!displayStatus) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  const style = STATUS_STYLES[displayStatus] ?? DEFAULT_STYLE;

  return (
    <span className={`px-2 py-1 text-xs rounded-md ${style}`}>
      {formatOutlineStatusLabel(displayStatus)}
    </span>
  );
}
