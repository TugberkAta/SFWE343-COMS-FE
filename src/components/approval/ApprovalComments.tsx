import * as React from "react";

export default function ApprovalComments({ comments }: { comments?: { id: string | number; author?: string; body: string; date: string }[] }) {
  if (!comments || comments.length === 0) return <div className="text-sm text-muted-foreground">No comments</div>;

  const sorted = comments.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-3">
      {sorted.map((c) => (
        <div key={c.id} className="rounded-md border border-border p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{c.author || "Reviewer"}</div>
            <div className="text-xs text-muted-foreground">{new Date(c.date).toLocaleString()}</div>
          </div>
          <div className="mt-2 text-sm">{c.body}</div>
        </div>
      ))}
    </div>
  );
}
