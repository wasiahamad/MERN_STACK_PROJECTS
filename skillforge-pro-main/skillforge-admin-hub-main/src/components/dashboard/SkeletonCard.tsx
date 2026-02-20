export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-4 w-24 rounded-md bg-muted" />
          <div className="h-8 w-32 rounded-md bg-muted" />
          <div className="h-3 w-28 rounded-md bg-muted" />
        </div>
        <div className="h-12 w-12 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
      <div className="h-5 w-40 rounded-md bg-muted mb-6" />
      <div className="space-y-3">
        <div className="flex items-end gap-2 h-[260px]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex-1 rounded-t-md bg-muted" style={{ height: `${30 + Math.random() * 70}%` }} />
          ))}
        </div>
        <div className="flex justify-between">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-3 w-8 rounded bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="rounded-2xl border border-border bg-card animate-pulse">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="h-5 w-24 rounded-md bg-muted" />
        <div className="h-9 w-64 rounded-lg bg-muted" />
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-4 w-48 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-6 w-16 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
