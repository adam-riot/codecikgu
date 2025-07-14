// Enhanced Mobile Gesture System
// src/components/mobile/MobileGestureManager.tsx

import React, { useEffect, useRef, useState, useCallback } from 'react'

export interface GestureConfig {
  swipeThreshold: number
  pinchThreshold: number
  longPressDelay: number
  doubleTapDelay: number
}

export interface GestureEvents {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinchZoom?: (scale: number) => void
  onLongPress?: (x: number, y: number) => void
  onDoubleTap?: (x: number, y: number) => void
  onRotate?: (angle: number) => void
}

interface TouchPoint {
  x: number
  y: number
  time: number
}

export function MobileGestureManager({ 
  children, 
  config = {
    swipeThreshold: 50,
    pinchThreshold: 0.1,
    longPressDelay: 500,
    doubleTapDelay: 300
  },
  events
}: {
  children: React.ReactNode
  config?: Partial<GestureConfig>
  events: GestureEvents
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [touches, setTouches] = useState<TouchPoint[]>([])
  const [lastTap, setLastTap] = useState<TouchPoint | null>(null)
  const longPressTimer = useRef<NodeJS.Timeout>()

  const defaultConfig: GestureConfig = {
    swipeThreshold: 50,
    pinchThreshold: 0.1,
    longPressDelay: 500,
    doubleTapDelay: 300,
    ...config
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const touchPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }

    setTouches([touchPoint])

    // Long press detection
    longPressTimer.current = setTimeout(() => {
      events.onLongPress?.(touchPoint.x, touchPoint.y)
    }, defaultConfig.longPressDelay)

  }, [events, defaultConfig.longPressDelay])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    
    if (e.touches.length === 2) {
      // Handle pinch/zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      
      // Calculate initial distance if not set
      const initialDistance = Math.sqrt(
        Math.pow(touches[1]?.x - touches[0]?.x || 0, 2) + 
        Math.pow(touches[1]?.y - touches[0]?.y || 0, 2)
      )
      
      if (initialDistance > 0) {
        const scale = currentDistance / initialDistance
        if (Math.abs(scale - 1) > defaultConfig.pinchThreshold) {
          events.onPinchZoom?.(scale)
        }
      }
    }

    // Clear long press if moved too much
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }, [touches, events, defaultConfig.pinchThreshold])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }

    if (touches.length === 0) return

    const startTouch = touches[0]
    const endTouch = e.changedTouches[0]
    
    const deltaX = endTouch.clientX - startTouch.x
    const deltaY = endTouch.clientY - startTouch.y
    const deltaTime = Date.now() - startTouch.time

    // Detect swipe gestures
    if (Math.abs(deltaX) > defaultConfig.swipeThreshold || Math.abs(deltaY) > defaultConfig.swipeThreshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          events.onSwipeRight?.()
        } else {
          events.onSwipeLeft?.()
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          events.onSwipeDown?.()
        } else {
          events.onSwipeUp?.()
        }
      }
    } else if (deltaTime < 200) {
      // Tap detected
      const tapPoint: TouchPoint = {
        x: endTouch.clientX,
        y: endTouch.clientY,
        time: Date.now()
      }

      // Double tap detection
      if (lastTap && 
          Date.now() - lastTap.time < defaultConfig.doubleTapDelay &&
          Math.abs(tapPoint.x - lastTap.x) < 30 &&
          Math.abs(tapPoint.y - lastTap.y) < 30) {
        events.onDoubleTap?.(tapPoint.x, tapPoint.y)
        setLastTap(null)
      } else {
        setLastTap(tapPoint)
      }
    }

    setTouches([])
  }, [touches, lastTap, events, defaultConfig])

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    >
      {children}
    </div>
  )
}

// Advanced Mobile Code Editor with Gestures
export function MobileCodeEditorEnhanced() {
  const [fontSize, setFontSize] = useState(14)
  const [currentTab, setCurrentTab] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)

  const tabs = ['main.js', 'utils.js', 'styles.css']

  const gestureEvents: GestureEvents = {
    onSwipeLeft: () => {
      // Next tab
      setCurrentTab((prev) => (prev + 1) % tabs.length)
    },
    onSwipeRight: () => {
      // Previous tab
      setCurrentTab((prev) => (prev - 1 + tabs.length) % tabs.length)
    },
    onSwipeUp: () => {
      // Show quick actions
      setShowQuickActions(true)
    },
    onSwipeDown: () => {
      // Hide quick actions
      setShowQuickActions(false)
    },
    onPinchZoom: (scale) => {
      // Adjust font size
      const newSize = Math.max(10, Math.min(24, fontSize * scale))
      setFontSize(newSize)
    },
    onDoubleTap: () => {
      // Toggle zoom mode
      setIsZoomed(!isZoomed)
    },
    onLongPress: (x, y) => {
      // Show context menu
      console.log('Context menu at', x, y)
    }
  }

  return (
    <div className="h-full bg-gray-900 text-white">
      <MobileGestureManager events={gestureEvents}>
        {/* Header with tabs */}
        <div className="flex bg-gray-800 overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(index)}
              className={`px-4 py-2 whitespace-nowrap transition-colors ${
                index === currentTab 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {tab}
              {index === currentTab && (
                <div className="w-full h-0.5 bg-blue-400 mt-1"></div>
              )}
            </button>
          ))}
        </div>

        {/* Editor area */}
        <div className={`flex-1 relative ${isZoomed ? 'transform scale-125' : ''}`}>
          <textarea
            className="w-full h-full bg-gray-900 text-white p-4 font-mono resize-none border-none outline-none"
            style={{ fontSize: `${fontSize}px` }}
            placeholder={`Write ${tabs[currentTab]} code here...`}
          />

          {/* Gesture indicators */}
          <div className="absolute top-2 right-2 flex flex-col space-y-1 text-xs text-gray-400">
            <div>← → Tabs</div>
            <div>↕ Actions</div>
            <div>🔍 Zoom</div>
            <div>📱 {fontSize}px</div>
          </div>
        </div>

        {/* Quick actions panel */}
        {showQuickActions && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4">
            <div className="grid grid-cols-4 gap-2">
              <button className="p-3 bg-blue-600 rounded text-sm">Run</button>
              <button className="p-3 bg-green-600 rounded text-sm">Save</button>
              <button className="p-3 bg-purple-600 rounded text-sm">Share</button>
              <button className="p-3 bg-orange-600 rounded text-sm">Upload</button>
            </div>
            
            <div className="mt-3 flex justify-center">
              <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        )}
      </MobileGestureManager>

      {/* Instructions overlay */}
      <div className="absolute top-16 left-4 right-4 bg-black/80 text-white p-3 rounded text-sm">
        <h3 className="font-bold mb-2">Mobile Gestures:</h3>
        <ul className="space-y-1 text-xs">
          <li>• Swipe left/right: Switch tabs</li>
          <li>• Swipe up/down: Show/hide quick actions</li>
          <li>• Pinch: Zoom text</li>
          <li>• Double tap: Toggle zoom mode</li>
          <li>• Long press: Context menu</li>
        </ul>
      </div>
    </div>
  )
}

// Hook for gesture detection
export function useGestures(ref: React.RefObject<HTMLElement>, events: GestureEvents) {
  useEffect(() => {
    const element = ref.current
    if (!element) return

    let startTouch: TouchPoint | null = null
    let longPressTimer: NodeJS.Timeout

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      startTouch = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      }

      longPressTimer = setTimeout(() => {
        if (startTouch) {
          events.onLongPress?.(startTouch.x, startTouch.y)
        }
      }, 500)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer)
      }

      if (!startTouch) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - startTouch.x
      const deltaY = touch.clientY - startTouch.y
      
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          events.onSwipeRight?.()
        } else {
          events.onSwipeLeft?.()
        }
      } else if (Math.abs(deltaY) > 50) {
        if (deltaY > 0) {
          events.onSwipeDown?.()
        } else {
          events.onSwipeUp?.()
        }
      }

      startTouch = null
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      if (longPressTimer) {
        clearTimeout(longPressTimer)
      }
    }
  }, [events])
}
