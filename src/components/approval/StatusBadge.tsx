import * as React from "react";

type Props = { status: string };

export default function StatusBadge({ status }: Props) {
  const styles: Record<string, string> = {
    in_review: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    stage_1_review: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    stage_2_approval: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    changes_requested: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    approved: "bg-green-500/10 text-green-400 border border-green-500/20",
    published: "bg-green-600/10 text-green-500 border border-green-600/20",
    rejected: "bg-red-500/10 text-red-400 border border-red-500/20",
  };

  const label = status ? status.replace(/_/g, " ") : "—";

  return <span className={`px-2 py-1 text-xs rounded-md ${styles[status] || "bg-muted text-muted-foreground"}`}>{label}</span>;
}
