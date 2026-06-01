import * as React from "react";

type TimelineEvent = {
  id: string | number;
  type: string;
  actor?: string;
  message?: string;
  date: string;
};

export default function ApprovalTimeline({ events }: { events?: TimelineEvent[] }) {
  const sorted = (events || []).slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-3">
      {sorted.length === 0 ? (
        <div className="text-sm text-muted-foreground">No timeline events</div>
      ) : (
        sorted.map((ev) => (
          <div key={ev.id} className="rounded-md border border-border p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="font-medium">{ev.type}</div>
              <div className="text-xs text-muted-foreground">{new Date(ev.date).toLocaleString()}</div>
            </div>
            {ev.actor ? <div className="text-sm text-muted-foreground">By {ev.actor}</div> : null}
            {ev.message ? <div className="mt-2 text-sm">{ev.message}</div> : null}
          </div>
        ))
      )}
    </div>
  );
}
