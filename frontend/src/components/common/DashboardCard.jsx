export function DashboardCard({ label, value, description }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md hover:scale-[1.01]">
      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-secondary">{description}</p>
    </div>
  )
}

