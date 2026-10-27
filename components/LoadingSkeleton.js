export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Stats Grid Skeleton */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-6"
          >
            <div className="mb-3 h-4 w-20 rounded bg-white/10 sm:w-24" />
            <div className="h-8 w-24 rounded bg-white/10 sm:w-32" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-6">
        <div className="mb-2 h-6 w-40 rounded bg-white/10 sm:w-48" />
        <div className="mb-5 h-4 w-52 rounded bg-white/10 sm:mb-6 sm:w-64" />
        <div className="h-[250px] rounded bg-white/10 sm:h-[300px]" />
      </div>

      {/* History Table Skeleton */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-6">
        <div className="mb-5 flex items-center justify-between sm:mb-6">
          <div className="h-6 w-40 rounded bg-white/10 sm:w-48" />
          <div className="h-10 w-24 rounded bg-white/10 sm:w-32" />
        </div>
        <div className="space-y-3 sm:space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 p-4">
              <div className="h-4 w-20 rounded bg-white/10 sm:w-24" />
              <div className="h-4 w-24 rounded bg-white/10 sm:w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 