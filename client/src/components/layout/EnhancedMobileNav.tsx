import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'wouter'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import { 
  Home, Bot, Calendar, DollarSign, Users, Store, Palette, 
  User, Clock, Globe, Sparkles, Armchair, UserPlus, Activity, 
  FileText, Menu, X, ChevronLeft, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

const navigation = [
  { name: "Dashboard", href: "/", icon: Home, color: "from-blush to-rose-gold" },
  { name: "Overview", href: "/overview", icon: FileText, color: "from-sage to-green-500" },
  { name: "AI Assistant", href: "/ai-assistant", icon: Bot, color: "from-blue-500 to-purple-500" },
  { name: "Timeline", href: "/timeline", icon: Calendar, color: "from-orange-500 to-red-500" },
  { name: "Budget", href: "/budget", icon: DollarSign, color: "from-green-500 to-emerald-500" },
  { name: "Guest List", href: "/guests", icon: Users, color: "from-pink-500 to-rose-500" },
  { name: "Seating Chart", href: "/seating-chart", icon: Armchair, color: "from-purple-500 to-indigo-500" },
  { name: "Vendors", href: "/vendors", icon: Store, color: "from-yellow-500 to-orange-500" },
  { name: "Schedules", href: "/schedules", icon: Clock, color: "from-teal-500 to-cyan-500" },
  { name: "Inspiration", href: "/inspiration", icon: Palette, color: "from-violet-500 to-purple-500" },
  { name: "Creative Details", href: "/creative-details", icon: Sparkles, color: "from-amber-500 to-yellow-500" },
  { name: "Resources", href: "/resources", icon: Globe, color: "from-indigo-500 to-blue-500" },
]

const accountNavigation = [
  { name: "Team", href: "/collaborators", icon: UserPlus, color: "from-emerald-500 to-green-500" },
  { name: "Activity Log", href: "/activity-log", icon: Activity, color: "from-slate-500 to-gray-500" },
  { name: "Profile", href: "/profile", icon: User, color: "from-rose-500 to-pink-500" },
]

interface EnhancedMobileNavProps {
  className?: string
}

export default function EnhancedMobileNav({ className }: EnhancedMobileNavProps) {
  const [location] = useLocation()
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Find current navigation index
  useEffect(() => {
    const currentNavIndex = navigation.findIndex(item => item.href === location)
    if (currentNavIndex !== -1) {
      setCurrentIndex(currentNavIndex)
    }
  }, [location])

  // Swipe handlers for navigation
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < navigation.length - 1) {
        setCurrentIndex(prev => prev + 1)
        // Navigate to next item
        const nextItem = navigation[currentIndex + 1]
        if (nextItem) {
          window.location.href = nextItem.href
        }
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1)
        // Navigate to previous item
        const prevItem = navigation[currentIndex - 1]
        if (prevItem) {
          window.location.href = prevItem.href
        }
      }
    },
    trackMouse: true,
    delta: 50,
    swipeDuration: 500,
  })

  // Enhanced touch feedback
  const handleTouchStart = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          setIsOpen(false)
          break
        case 'ArrowLeft':
          if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
          }
          break
        case 'ArrowRight':
          if (currentIndex < navigation.length - 1) {
            setCurrentIndex(prev => prev + 1)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex])

  if (!isMobile) return null

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blush to-rose-gold text-white shadow-lg",
          "flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blush focus:ring-offset-2",
          className
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        onTouchStart={handleTouchStart}
      >
        <Menu size={24} />
      </motion.button>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              ref={containerRef}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 gradient-blush-rose rounded-xl flex items-center justify-center">
                    <FileText className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-gray-800">PlanHaus</h2>
                    <p className="text-xs text-gray-500">AI Wedding Planning</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onTouchStart={handleTouchStart}
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Navigation Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* Current Page Indicator */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Current Page</span>
                    <span className="text-xs text-gray-400">{currentIndex + 1} of {navigation.length}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() => {
                        if (currentIndex > 0) {
                          setCurrentIndex(prev => prev - 1)
                        }
                      }}
                      disabled={currentIndex === 0}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronLeft size={16} />
                    </motion.button>
                    
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blush to-rose-gold"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / navigation.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    
                    <motion.button
                      onClick={() => {
                        if (currentIndex < navigation.length - 1) {
                          setCurrentIndex(prev => prev + 1)
                        }
                      }}
                      disabled={currentIndex === navigation.length - 1}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronRight size={16} />
                    </motion.button>
                  </div>
                </div>

                {/* Navigation Items */}
                <div {...swipeHandlers} className="space-y-2">
                  {navigation.map((item, index) => {
                    const Icon = item.icon
                    const isActive = location === item.href
                    const isCurrent = index === currentIndex
                    
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative"
                      >
                        <Link href={item.href}>
                          <motion.div
                            className={cn(
                              "flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200",
                              "focus:outline-none focus:ring-2 focus:ring-blush focus:ring-offset-2",
                              isActive 
                                ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                            )}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onTouchStart={handleTouchStart}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              isActive ? "bg-white/20" : "bg-gray-100"
                            )}>
                              <Icon size={20} />
                            </div>
                            <div className="flex-1">
                              <span className="font-medium">{item.name}</span>
                              {isCurrent && (
                                <motion.div
                                  className="text-xs opacity-75 mt-1"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                >
                                  Current page
                                </motion.div>
                              )}
                            </div>
                            {isActive && (
                              <motion.div
                                className="w-2 h-2 bg-white rounded-full"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring" }}
                              />
                            )}
                          </motion.div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Account Navigation */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Account
                  </h3>
                  <div className="space-y-2">
                    {accountNavigation.map((item, index) => {
                      const Icon = item.icon
                      const isActive = location === item.href
                      
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (navigation.length + index) * 0.05 }}
                        >
                          <Link href={item.href}>
                            <motion.div
                              className={cn(
                                "flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200",
                                "focus:outline-none focus:ring-2 focus:ring-blush focus:ring-offset-2",
                                isActive 
                                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                              )}
                              whileHover={{ scale: 1.02, x: 4 }}
                              whileTap={{ scale: 0.98 }}
                              onTouchStart={handleTouchStart}
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                isActive ? "bg-white/20" : "bg-gray-100"
                              )}>
                                <Icon size={20} />
                              </div>
                              <span className="font-medium">{item.name}</span>
                            </motion.div>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      className="p-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onTouchStart={handleTouchStart}
                    >
                      <div className="text-sm font-medium">Add Task</div>
                      <div className="text-xs opacity-75">Quick entry</div>
                    </motion.button>
                    <motion.button
                      className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onTouchStart={handleTouchStart}
                    >
                      <div className="text-sm font-medium">AI Help</div>
                      <div className="text-xs opacity-75">Get advice</div>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 