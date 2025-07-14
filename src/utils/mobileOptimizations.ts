// Enhanced Mobile PWA Optimizations
// src/utils/mobileOptimizations.ts

export interface MobileOptimizations {
  enableVirtualKeyboard: () => void
  disableZoom: () => void
  enableFullscreen: () => void
  optimizeViewport: () => void
  enhanceTouch: () => void
  preventScrollBounce: () => void
}

export class MobileOptimizer {
  private static instance: MobileOptimizer
  private isInitialized = false

  static getInstance(): MobileOptimizer {
    if (!MobileOptimizer.instance) {
      MobileOptimizer.instance = new MobileOptimizer()
    }
    return MobileOptimizer.instance
  }

  initialize(): void {
    if (this.isInitialized) return
    
    this.optimizeViewport()
    this.enhanceTouch()
    this.preventScrollBounce()
    this.setupOrientationHandler()
    this.setupKeyboardHandler()
    this.optimizePerformance()
    
    this.isInitialized = true
  }

  private optimizeViewport(): void {
    // Optimize viewport for mobile coding
    const viewport = document.querySelector('meta[name="viewport"]')
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      )
    }

    // Set CSS viewport units
    const setVH = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }
    
    setVH()
    window.addEventListener('resize', setVH)
    window.addEventListener('orientationchange', () => {
      setTimeout(setVH, 100)
    })
  }

  private enhanceTouch(): void {
    // Improve touch responsiveness
    document.addEventListener('touchstart', () => {}, { passive: true })
    document.addEventListener('touchmove', () => {}, { passive: true })
    
    // Fast click for mobile
    document.addEventListener('touchend', (e) => {
      e.preventDefault()
      const target = e.target as HTMLElement
      if (target && target.click) {
        target.click()
      }
    })

    // Add touch feedback
    const style = document.createElement('style')
    style.textContent = `
      .touch-feedback {
        -webkit-tap-highlight-color: rgba(138, 43, 226, 0.3);
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      button, .btn, .touch-target {
        -webkit-tap-highlight-color: rgba(138, 43, 226, 0.3);
        touch-action: manipulation;
      }
      
      textarea, input[type="text"], .code-editor {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
    `
    document.head.appendChild(style)
  }

  private preventScrollBounce(): void {
    // Prevent iOS bounce scroll
    document.addEventListener('touchmove', (e) => {
      const target = e.target as HTMLElement
      
      // Allow scrolling in specific elements
      if (target.closest('.scrollable, textarea, .code-editor, .output-terminal')) {
        return
      }
      
      e.preventDefault()
    }, { passive: false })
  }

  private setupOrientationHandler(): void {
    const handleOrientationChange = () => {
      // Delay to ensure viewport is updated
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'))
        
        // Trigger keyboard hide on rotation
        const activeElement = document.activeElement as HTMLElement
        if (activeElement && activeElement.blur) {
          activeElement.blur()
        }
        
        // Re-focus if it was a code editor
        setTimeout(() => {
          if (activeElement && activeElement.classList.contains('code-editor')) {
            activeElement.focus()
          }
        }, 300)
      }, 100)
    }

    window.addEventListener('orientationchange', handleOrientationChange)
    screen.orientation?.addEventListener?.('change', handleOrientationChange)
  }

  private setupKeyboardHandler(): void {
    let initialViewportHeight = window.innerHeight
    
    const handleViewportChange = () => {
      const currentHeight = window.innerHeight
      const heightDifference = initialViewportHeight - currentHeight
      
      // Keyboard is likely open if height decreased significantly
      const keyboardOpen = heightDifference > 150
      
      document.body.classList.toggle('keyboard-open', keyboardOpen)
      
      // Adjust layout for keyboard
      if (keyboardOpen) {
        document.documentElement.style.setProperty('--keyboard-height', `${heightDifference}px`)
      } else {
        document.documentElement.style.removeProperty('--keyboard-height')
      }
    }

    window.addEventListener('resize', handleViewportChange)
    
    // Visual viewport API support
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange)
    }

    // Add keyboard-specific styles
    const keyboardStyles = document.createElement('style')
    keyboardStyles.textContent = `
      .keyboard-open .bottom-nav {
        transform: translateY(var(--keyboard-height, 0));
      }
      
      .keyboard-open .code-editor-container {
        height: calc(100vh - var(--keyboard-height, 0) - 120px);
      }
      
      .keyboard-open .output-panel {
        max-height: 120px;
      }
    `
    document.head.appendChild(keyboardStyles)
  }

  private optimizePerformance(): void {
    // Enable hardware acceleration for smooth animations
    const performanceStyles = document.createElement('style')
    performanceStyles.textContent = `
      .code-editor, .mobile-playground, .tab-content {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
      }
      
      .scroll-smooth {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }
      
      /* Optimize text rendering */
      .code-editor {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }
      
      /* Reduce repaints */
      .mobile-tab {
        will-change: transform;
      }
      
      .mobile-tab.active {
        will-change: auto;
      }
    `
    document.head.appendChild(performanceStyles)
  }

  enableFullscreen(): boolean {
    const elem = document.documentElement
    
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
      return true
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen()
      return true
    } else if ((elem as any).msRequestFullscreen) {
      (elem as any).msRequestFullscreen()
      return true
    }
    
    return false
  }

  exitFullscreen(): boolean {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      return true
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen()
      return true
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen()
      return true
    }
    
    return false
  }

  isFullscreen(): boolean {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).msFullscreenElement
    )
  }

  vibrate(pattern: number | number[] = 50): boolean {
    if ('vibrate' in navigator) {
      return navigator.vibrate(pattern)
    }
    return false
  }

  addToHomeScreen(): void {
    // This would be triggered by beforeinstallprompt event
    window.dispatchEvent(new CustomEvent('show-install-prompt'))
  }

  getDeviceInfo() {
    const userAgent = navigator.userAgent
    
    return {
      isIOS: /iPad|iPhone|iPod/.test(userAgent),
      isAndroid: /Android/.test(userAgent),
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
      isTablet: /iPad/.test(userAgent) || (/Android/.test(userAgent) && !/Mobile/.test(userAgent)),
      hasTouch: 'ontouchstart' in window,
      orientation: screen.orientation?.type || 'unknown',
      screenSize: {
        width: screen.width,
        height: screen.height
      },
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
  }
}

// Auto-initialize on mobile devices
if (typeof window !== 'undefined') {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  if (isMobile) {
    document.addEventListener('DOMContentLoaded', () => {
      MobileOptimizer.getInstance().initialize()
    })
  }
}

export default MobileOptimizer
