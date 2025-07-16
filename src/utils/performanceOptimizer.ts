// Advanced Performance Optimization System
// src/utils/performanceOptimizer.ts

export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  bundleSize: number
  memoryUsage: number
  cacheHitRate: number
}

export interface OptimizationStrategy {
  lazyLoading: boolean
  codesplitting: boolean
  serviceWorker: boolean
  compression: boolean
  caching: CacheStrategy
}

export interface CacheStrategy {
  static: 'cache-first' | 'stale-while-revalidate'
  dynamic: 'network-first' | 'cache-first'
  api: 'network-first' | 'cache-only'
  ttl: number
}

export class PerformanceOptimizer {
  private static metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    bundleSize: 0,
    memoryUsage: 0,
    cacheHitRate: 0
  }

  /**
   * Initialize performance monitoring
   */
  static init(): void {
    // Performance observer untuk Core Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.observeWebVitals()
      this.observeResourceTiming()
      this.observeMemoryUsage()
    }
  }

  /**
   * Observe Core Web Vitals (LCP, FID, CLS)
   */
  private static observeWebVitals(): void {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('📊 LCP:', entry.startTime)
          this.reportMetric('lcp', entry.startTime)
        }
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as any
        if (fidEntry.processingStart) {
          console.log('📊 FID:', fidEntry.processingStart - fidEntry.startTime)
          this.reportMetric('fid', fidEntry.processingStart - fidEntry.startTime)
        }
      }
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      let clsValue = 0
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
      console.log('📊 CLS:', clsValue)
      this.reportMetric('cls', clsValue)
    }).observe({ entryTypes: ['layout-shift'] })
  }

  /**
   * Observe resource loading performance
   */
  private static observeResourceTiming(): void {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming
        
        // Log slow resources
        if (resource.duration > 1000) {
          console.warn('🐌 Slow resource:', resource.name, `${resource.duration}ms`)
        }
        
        // Track cache hits
        if (resource.transferSize === 0) {
          this.metrics.cacheHitRate++
        }
      }
    }).observe({ entryTypes: ['resource'] })
  }

  /**
   * Monitor memory usage
   */
  private static observeMemoryUsage(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        this.metrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit
        
        // Warn if memory usage is high
        if (this.metrics.memoryUsage > 0.8) {
          console.warn('⚠️ High memory usage:', `${(this.metrics.memoryUsage * 100).toFixed(1)}%`)
        }
      }, 10000) // Check every 10 seconds
    }
  }

  /**
   * Report metrics to analytics
   */
  private static reportMetric(name: string, value: number): void {
    // Send to analytics service (implementation depends on analytics provider)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        metric_name: name,
        metric_value: Math.round(value),
        custom_parameter: 'codecikgu_performance'
      })
    }
  }

  /**
   * Get current performance metrics
   */
  static getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Preload critical resources
   */
  static preloadCriticalResources(): void {
    const criticalResources = [
      '/fonts/mono-font.woff2',
      '/api/user/profile',
      '/api/challenges/featured'
    ]

    criticalResources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource
      link.as = resource.includes('.woff') ? 'font' : 'fetch'
      if (link.as === 'font') {
        link.crossOrigin = 'anonymous'
      }
      document.head.appendChild(link)
    })
  }

  /**
   * Implement image lazy loading dengan intersection observer
   */
  static initImageLazyLoading(): void {
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

  /**
   * Optimize bundle loading dengan dynamic imports
   */
  static async loadComponentDynamically<T>(
    componentPath: string, 
    fallback?: React.ComponentType
  ): Promise<T> {
    try {
      const startTime = performance.now()
      const module = await import(componentPath)
      const loadTime = performance.now() - startTime
      
      console.log(`📦 Component loaded: ${componentPath} in ${loadTime.toFixed(2)}ms`)
      
      return module.default || module
    } catch (error) {
      console.error(`❌ Failed to load component: ${componentPath}`, error)
      throw error
    }
  }

  /**
   * Service Worker registration untuk caching
   */
  static registerServiceWorker(): void {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('✅ SW registered:', registration)
          })
          .catch(error => {
            console.log('❌ SW registration failed:', error)
          })
      })
    }
  }

  /**
   * Optimize code editor performance
   */
  static optimizeCodeEditor() {
    // Debounce untuk syntax highlighting
    let highlightTimeout: NodeJS.Timeout
    
    return {
      debouncedHighlight: (callback: () => void, delay = 300) => {
        clearTimeout(highlightTimeout)
        highlightTimeout = setTimeout(callback, delay)
      },
      
      // Virtual scrolling untuk large files
      virtualScrolling: (content: string[], viewportHeight: number) => {
        const itemHeight = 20 // pixels per line
        const visibleItems = Math.ceil(viewportHeight / itemHeight)
        const buffer = 5
        
        return {
          totalHeight: content.length * itemHeight,
          visibleItems: visibleItems + buffer * 2,
          startIndex: Math.max(0, Math.floor(window.scrollY / itemHeight) - buffer)
        }
      }
    }
  }

  /**
   * Mobile performance optimizations
   */
  static optimizeForMobile(): void {
    // Reduce animations untuk low-end devices
    const isLowEndDevice = navigator.hardwareConcurrency <= 2
    
    if (isLowEndDevice) {
      document.documentElement.style.setProperty('--animation-duration', '0.1s')
      console.log('📱 Low-end device detected, reducing animations')
    }

    // Touch delay optimization
    let touchstartX = 0
    let touchstartY = 0

    document.addEventListener('touchstart', e => {
      touchstartX = e.changedTouches[0].screenX
      touchstartY = e.changedTouches[0].screenY
    }, { passive: true })

    document.addEventListener('touchend', e => {
      const touchendX = e.changedTouches[0].screenX
      const touchendY = e.changedTouches[0].screenY
      
      // Handle swipe gestures
      const deltaX = touchendX - touchstartX
      const deltaY = touchendY - touchstartY
      
      if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 50) {
        // Horizontal swipe
        const direction = deltaX > 0 ? 'right' : 'left'
        document.dispatchEvent(new CustomEvent('swipe', { detail: { direction } }))
      }
    }, { passive: true })
  }

  /**
   * Database query optimization
   */
  static optimizeQueries() {
    return {
      // Batch multiple queries
      batchQueries: async (queries: Promise<any>[]) => {
        const results = await Promise.allSettled(queries)
        return results.map(result => 
          result.status === 'fulfilled' ? result.value : null
        )
      },

      // Cache query results
      queryCache: new Map<string, { data: any, timestamp: number, ttl: number }>(),
      
      cachedQuery: async function<T>(
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
    }
  }
}

// Auto-initialize performance monitoring
if (typeof window !== 'undefined') {
  PerformanceOptimizer.init()
  PerformanceOptimizer.preloadCriticalResources()
  PerformanceOptimizer.initImageLazyLoading()
  PerformanceOptimizer.registerServiceWorker()
  PerformanceOptimizer.optimizeForMobile()
}
