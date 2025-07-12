// Enhanced loading skeleton components
export const SkeletonCard = () => (
  <div className="glass-dark rounded-xl p-6 animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  </div>
)

export const SkeletonTable = () => (
  <div className="glass-dark rounded-xl overflow-hidden">
    <div className="p-6 border-b border-gray-700/50">
      <div className="h-6 bg-gray-700 rounded w-1/4 animate-pulse"></div>
    </div>
    <div className="p-6 space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 animate-pulse">
          <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="w-16 h-8 bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  </div>
)

export const SkeletonStats = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="glass-dark rounded-xl p-6 text-center animate-pulse">
        <div className="w-12 h-12 bg-gray-700 rounded-lg mx-auto mb-4"></div>
        <div className="h-8 bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
      </div>
    ))}
  </div>
)

export const SkeletonPlayground = () => (
  <div className="space-y-6">
    {/* Editor Skeleton */}
    <div className="glass-dark rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
        <div className="flex space-x-2">
          <div className="w-20 h-8 bg-gray-700 rounded animate-pulse"></div>
          <div className="w-16 h-8 bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="w-24 h-8 bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="flex space-x-2">
              <div className="w-8 h-4 bg-gray-700 rounded animate-pulse"></div>
              <div className={`h-4 bg-gray-700 rounded animate-pulse ${
                i % 3 === 0 ? 'w-3/4' : i % 3 === 1 ? 'w-1/2' : 'w-5/6'
              }`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
    
    {/* Output Skeleton */}
    <div className="glass-dark rounded-xl p-4">
      <div className="h-6 bg-gray-700 rounded w-1/4 mb-4 animate-pulse"></div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
        ))}
      </div>
    </div>
  </div>
)

export const SkeletonLeaderboard = () => (
  <div className="space-y-6">
    {/* Top 3 Skeleton */}
    <div className="glass-dark rounded-2xl p-8">
      <div className="h-8 bg-gray-700 rounded w-1/3 mx-auto mb-8 animate-pulse"></div>
      <div className="flex justify-center items-end space-x-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center animate-pulse">
            <div className={`${
              i === 1 ? 'w-24 h-20' : 'w-20 h-16'
            } bg-gray-700 rounded-t-lg mx-auto mb-2`}></div>
            <div className="glass-dark p-4 rounded-lg">
              <div className="h-5 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-700 rounded mb-2 w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    {/* Table Skeleton */}
    <SkeletonTable />
  </div>
)
