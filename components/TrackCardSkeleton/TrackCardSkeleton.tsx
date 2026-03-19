export function TrackCardSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col overflow-hidden rounded-2xl bg-white/[0.03] p-3">
      {/* Album Art Skeleton */}
      <div className="mb-3.5 aspect-square w-full rounded-xl bg-white/[0.06]" />

      {/* Track Info Skeleton */}
      <div className="space-y-2 px-1">
        <div className="h-3.5 w-3/4 rounded-lg bg-white/[0.08]" />
        <div className="h-2.5 w-1/2 rounded-lg bg-white/[0.05]" />
      </div>
    </div>
  )
}
