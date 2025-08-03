// Performance optimization utilities
import { useEffect, useRef, useCallback, useState } from 'react'

// Performance monitoring class
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map()
  private static observers: PerformanceObserver[] = []

  static startTimer(label: string): () => void {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.recordMetric(label, duration)
    }
  }

  static recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, [])
    }
    this.metrics.get(label)!.push(value)
  }

  static getAverageMetric(label: string): number {
    const values = this.metrics.get(label) || []
    if (values.length === 0) return 0
    return values.reduce((a, b) => a + b, 0) / values.length
  }

  static getMetrics(): Record<string, { average: number; count: number; min: number; max: number }> {
    const result: Record<string, any> = {}
    
    for (const [label, values] of this.metrics.entries()) {
      if (values.length > 0) {
        result[label] = {
          average: values.reduce((a, b) => a + b, 0) / values.length,
          count: values.length,
          min: Math.min(...values),
          max: Math.max(...values)
        }
      }
    }
    
    return result
  }

  static initPerformanceMonitoring(): void {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            console.warn('Long task detected:', entry)
          }
        }
      })
      observer.observe({ entryTypes: ['longtask'] })
      this.observers.push(observer)
    }

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
          console.warn('High memory usage detected:', memory)
        }
      }, 10000)
    }
  }

  static cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Cache management
export class CacheManager {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  static set(key: string, data: any, ttl = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  static get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  static clear(): void {
    this.cache.clear()
  }

  static getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Image optimization utilities
export class ImageOptimizer {
  static preloadCriticalImages(): void {
    const criticalImages = [
      '/favicon.svg',
      '/next.svg',
      '/vercel.svg'
    ]

    criticalImages.forEach(src => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
    })
  }

  static lazyLoadImages(): void {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.classList.remove('lazy')
            observer.unobserve(img)
          }
        }
      })
    })

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img)
    })
  }

  static optimizeImageQuality(src: string, quality = 0.8): string {
    // Add quality parameter for image optimization
    if (src.includes('?')) {
      return `${src}&q=${quality}`
    }
    return `${src}?q=${quality}`
  }
}

// Bundle optimization
export class BundleOptimizer {
  static async loadComponentDynamically<T>(
    componentPath: string, 
    fallback?: React.ComponentType
  ): Promise<T> {
    try {
      const module = await import(componentPath)
      return module.default || module
    } catch (error) {
      console.error('Failed to load component:', componentPath, error)
      if (fallback) {
        return fallback as T
      }
      throw error
    }
  }

  static preloadComponent(componentPath: string): void {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = componentPath
    document.head.appendChild(link)
  }

  static optimizeForMobile(): void {
    // Touch event optimization
    let touchStartY = 0
    let touchEndY = 0

    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY
    }, { passive: true })

    document.addEventListener('touchend', (e) => {
      touchEndY = e.changedTouches[0].clientY
      const diff = touchStartY - touchEndY

      if (Math.abs(diff) > 50) {
        const direction = diff > 0 ? 'up' : 'down'
        document.dispatchEvent(new CustomEvent('swipe', { detail: { direction } }))
      }
    }, { passive: true })
  }
}

// Database query optimization
export class QueryOptimizer {
  private static queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  static async batchQueries<T>(queries: Promise<T>[]): Promise<T[]> {
    const results = await Promise.allSettled(queries)
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : null
    ) as T[]
  }

  static async cachedQuery<T>(
    key: string, 
    queryFn: () => Promise<T>, 
    ttl = 300000 // 5 minutes
  ): Promise<T> {
    const cached = this.queryCache.get(key)
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }
    
    const data = await queryFn()
    this.queryCache.set(key, { data, timestamp: Date.now(), ttl })
    return data
  }

  static clearCache(): void {
    this.queryCache.clear()
  }

  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.queryCache.size,
      keys: Array.from(this.queryCache.keys())
    }
  }
}

// React performance hooks
export function usePerformanceMonitor(label: string) {
  const startTime = useRef<number>()

  useEffect(() => {
    startTime.current = performance.now()
    
    return () => {
      if (startTime.current) {
        const duration = performance.now() - startTime.current
        PerformanceMonitor.recordMetric(label, duration)
      }
    }
  }, [label])
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRun = useRef<number>(0)

  useEffect(() => {
    const now = Date.now()
    if (now - lastRun.current >= delay) {
      setThrottledValue(value)
      lastRun.current = now
    } else {
      const handler = setTimeout(() => {
        setThrottledValue(value)
        lastRun.current = Date.now()
      }, delay - (now - lastRun.current))

      return () => clearTimeout(handler)
    }
  }, [value, delay])

  return throttledValue
}

export function useIntersectionObserver(
  callback: (isIntersecting: boolean) => void,
  options: IntersectionObserverInit = {}
) {
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        callback(entry.isIntersecting)
      })
    }, options)

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [callback, options])

  return elementRef
}

// Auto-initialize performance monitoring
if (typeof window !== 'undefined') {
  PerformanceMonitor.initPerformanceMonitoring()
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    PerformanceMonitor.cleanup()
  })
}

// Export main performance optimizer class
export class PerformanceOptimizer {
  static preloadCriticalResources(): void {
    ImageOptimizer.preloadCriticalImages()
  }

  static initImageLazyLoading(): void {
    ImageOptimizer.lazyLoadImages()
  }

  static async loadComponentDynamically<T>(
    componentPath: string, 
    fallback?: React.ComponentType
  ): Promise<T> {
    return BundleOptimizer.loadComponentDynamically(componentPath, fallback)
  }

  static optimizeForMobile(): void {
    BundleOptimizer.optimizeForMobile()
  }

  static optimizeQueries() {
    return QueryOptimizer
  }

  static getMetrics() {
    return PerformanceMonitor.getMetrics()
  }

  static getCacheStats() {
    return {
      componentCache: CacheManager.getStats(),
      queryCache: QueryOptimizer.getCacheStats()
    }
  }
}
