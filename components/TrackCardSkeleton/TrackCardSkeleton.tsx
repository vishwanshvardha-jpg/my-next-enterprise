export function TrackCardSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col overflow-hidden rounded-[2rem] border border-white/5 bg-white/5 p-4">
      {/* Album Art Skeleton */}
      <div className="mb-5 aspect-square w-full rounded-[1.5rem] bg-white/5 shadow-2xl" />

      {/* Track Info Skeleton */}
      <div className="space-y-3 px-2">
        <div className="h-4 w-3/4 rounded-full bg-white/10" />
        <div className="h-2 w-1/2 rounded-full bg-white/5" />
      </div>
    </div>
  )
}
