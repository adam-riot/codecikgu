interface SkeletonCardProps {
  lines?: number
  showAvatar?: boolean
  className?: string
}

export default function SkeletonCard({ 
  lines = 3, 
  showAvatar = false, 
  className = '' 
}: SkeletonCardProps) {
  return (
    <div className={`glass-dark rounded-xl p-6 animate-pulse ${className}`}>
      {showAvatar && (
        <div className="flex items-center mb-4">
          <div className="skeleton-avatar mr-4"></div>
          <div className="flex-1">
            <div className="skeleton-title w-1/2"></div>
            <div className="skeleton-text w-1/3"></div>
          </div>
        </div>
      )}
      
      {!showAvatar && (
        <div className="skeleton-title w-3/4 mb-4"></div>
      )}
      
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index}
          className={`skeleton-text ${
            index === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        ></div>
      ))}
      
      <div className="flex justify-between items-center mt-4">
        <div className="skeleton-text w-1/4"></div>
        <div className="skeleton-text w-1/3"></div>
      </div>
    </div>
  )
}

