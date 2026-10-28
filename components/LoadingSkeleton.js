export default function LoadingSkeleton() {
  return (
    <div>
      <p role="status" className="sr-only">Loading measurements…</p>
      <div aria-hidden="true" className="animate-pulse space-y-6 sm:space-y-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="surface-panel p-4 sm:p-6">
              <div className="mb-3 h-3 w-20 rounded bg-white/10 sm:w-24" />
              <div className="h-8 w-24 rounded bg-white/10 sm:w-32" />
            </div>
          ))}
        </div>
        <div className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.03] sm:w-44" />
        <div className="flex h-11 items-center gap-6 border-b border-white/10">
          <div className="h-3 w-16 rounded bg-white/10" />
          <div className="h-3 w-16 rounded bg-white/10" />
        </div>
        <div className="surface-panel p-4 sm:p-6">
          <div className="mb-3 h-5 w-40 rounded bg-white/10" />
          <div className="mb-6 h-3 w-48 rounded bg-white/10" />
          <div className="h-[260px] rounded-xl bg-white/[0.03] sm:h-[300px]" />
        </div>
      </div>
    </div>
  );
}
