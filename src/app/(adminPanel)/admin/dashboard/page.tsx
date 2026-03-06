

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

export default function AdminDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Key metrics and recent activity
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value="12,482" delta="+3.2%" trend="up" />
        <StatCard label="Active Sessions" value="1,028" delta="-1.1%" trend="down" />
        <StatCard label="Revenue" value="$48,920" delta="+8.4%" trend="up" />
        <StatCard label="Errors" value="23" delta="0%" trend="neutral" />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">Weekly Signups</h2>
            <span className="text-xs text-slate-400">Last 7 days</span>
          </div>
          <div className="mt-4 h-40 rounded-md bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="lg:col-span-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">Top Products</h2>
            <span className="text-xs text-slate-400">This month</span>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">Pro Subscription</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">$18,240</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">Team Plan</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">$12,430</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">Add-ons</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">$6,980</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
