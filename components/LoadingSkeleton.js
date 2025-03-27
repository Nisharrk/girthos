export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden border border-white/10"
          >
            <div className="h-4 w-24 bg-white/10 rounded mb-3" />
            <div className="h-8 w-32 bg-white/10 rounded" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="h-6 w-48 bg-white/10 rounded mb-2" />
        <div className="h-4 w-64 bg-white/10 rounded mb-6" />
        <div className="h-[300px] bg-white/10 rounded" />
      </div>

      {/* History Table Skeleton */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mt-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-48 bg-white/10 rounded" />
          <div className="h-10 w-32 bg-white/10 rounded" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="h-4 w-24 bg-white/10 rounded" />
              <div className="h-4 w-32 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 