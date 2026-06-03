import OutlineStatusBadge from "@/components/outlines/outline-status-badge";

type WorkflowStatusBadgeProps = {
  status?: string | null;
  stage?: string | null;
};

export default function WorkflowStatusBadge({
  status,
  stage,
}: WorkflowStatusBadgeProps) {
  if (!status && !stage) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <OutlineStatusBadge status={status ?? ""} currentStage={stage} />
  );
}
