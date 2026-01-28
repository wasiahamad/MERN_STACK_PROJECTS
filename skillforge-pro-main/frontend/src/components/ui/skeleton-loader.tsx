import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  lines?: number;
}

export function SkeletonLoader({ className, variant = "rectangular", lines = 1 }: SkeletonLoaderProps) {
  if (variant === "text" && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "relative overflow-hidden rounded bg-muted",
              i === lines - 1 ? "w-3/4" : "w-full",
              "h-4",
              className
            )}
          >
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent" />
          </div>
        ))}
      </div>
    );
  }

  const baseClasses = cn(
    "relative overflow-hidden bg-muted",
    {
      "rounded h-4": variant === "text",
      "rounded-full": variant === "circular",
      "rounded-lg": variant === "rectangular" || variant === "card",
    },
    className
  );

  return (
    <div className={baseClasses}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-4">
        <SkeletonLoader variant="circular" className="h-12 w-12" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader variant="text" className="h-4 w-1/3" />
          <SkeletonLoader variant="text" className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonLoader variant="text" lines={3} />
      <div className="flex gap-2">
        <SkeletonLoader className="h-8 w-20 rounded-full" />
        <SkeletonLoader className="h-8 w-20 rounded-full" />
        <SkeletonLoader className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <SkeletonLoader variant="rectangular" className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <SkeletonLoader variant="text" className="h-5 w-32" />
            <SkeletonLoader variant="text" className="h-3 w-24" />
          </div>
        </div>
        <SkeletonLoader className="h-6 w-16 rounded-full" />
      </div>
      <SkeletonLoader variant="text" lines={2} />
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonLoader key={i} className="h-6 w-16 rounded-full" />
        ))}
      </div>
      <div className="flex items-center justify-between pt-2">
        <SkeletonLoader variant="text" className="h-4 w-24" />
        <SkeletonLoader className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <SkeletonLoader variant="circular" className="h-24 w-24" />
        <div className="space-y-3 flex-1">
          <SkeletonLoader variant="text" className="h-6 w-1/3" />
          <SkeletonLoader variant="text" className="h-4 w-1/4" />
          <div className="flex gap-2">
            <SkeletonLoader className="h-6 w-20 rounded-full" />
            <SkeletonLoader className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid gap-4">
        <SkeletonLoader className="h-32 w-full rounded-xl" />
        <SkeletonLoader className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="bg-muted/50 p-4 flex gap-4">
        <SkeletonLoader className="h-4 w-1/4" />
        <SkeletonLoader className="h-4 w-1/4" />
        <SkeletonLoader className="h-4 w-1/4" />
        <SkeletonLoader className="h-4 w-1/4" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex gap-4 border-t border-border">
          <SkeletonLoader className="h-4 w-1/4" />
          <SkeletonLoader className="h-4 w-1/4" />
          <SkeletonLoader className="h-4 w-1/4" />
          <SkeletonLoader className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
