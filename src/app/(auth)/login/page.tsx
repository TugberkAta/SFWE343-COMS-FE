

type StatCardProps = {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "neutral";
};

function StatCard({ label, value, delta, trend = "neutral" }: StatCardProps) {
  const trendColor =
    trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-slate-500";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</div>
        {delta ? (
          <div className={`text-xs font-medium ${trendColor}`}>{delta}</div>
        ) : null}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}

export default function AdminSignnPage() {
  return (
  <div>test</div>
  );
}
