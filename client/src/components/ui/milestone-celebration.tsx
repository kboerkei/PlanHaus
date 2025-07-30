import * as React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Heart, Sparkles, PartyPopper } from "lucide-react"
import { cn } from "@/lib/utils"
import { WeddingCard, WeddingCardContent } from "./wedding-card"
import confetti from "canvas-confetti"

interface MilestoneCelebrationProps {
  milestone: {
    id: string
    title: string
    description?: string
    completed: boolean
    completedAt?: Date
  }
  onDismiss?: () => void
  className?: string
}

const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({
  milestone,
  onDismiss,
  className
}) => {
  const [showCelebration, setShowCelebration] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (milestone.completed && !showCelebration) {
      setShowCelebration(true)
      setIsVisible(true)
      
      // Trigger confetti animation
      const triggerCelebration = () => {
        const duration = 3000
        const end = Date.now() + duration

        const colors = ['#f8a5c2', '#f9c2a0', '#fde2a7', '#a7c4bc']

        const frame = () => {
          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors: colors
          })
          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors: colors
          })

          if (Date.now() < end) {
            requestAnimationFrame(frame)
          }
        }
        frame()
      }

      triggerCelebration()

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          setShowCelebration(false)
          onDismiss?.()
        }, 500)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [milestone.completed, showCelebration, onDismiss])

  if (!showCelebration) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 20,
            duration: 0.6 
          }}
          className={cn(
            "fixed bottom-4 right-4 z-50 max-w-sm",
            "md:bottom-6 md:right-6",
            className
          )}
        >
          <WeddingCard variant="floating" className="overflow-hidden">
            <WeddingCardContent className="p-6">
              <div className="flex items-start space-x-4">
                {/* Animated Icon */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="flex-shrink-0"
                >
                  <div className="relative">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <motion.div
                      animate={{ 
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                      className="absolute -top-1 -right-1"
                    >
                      <Sparkles className="w-4 h-4 text-rose-gold" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <PartyPopper className="w-4 h-4 text-rose-gold" />
                    <h3 className="font-serif font-semibold text-gray-800 text-lg">
                      Milestone Achieved!
                    </h3>
                  </div>
                  
                  <p className="text-sm font-medium text-dusty-rose mb-1">
                    {milestone.title}
                  </p>
                  
                  {milestone.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {milestone.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3 text-rose-gold fill-current" />
                      <span className="text-xs text-gray-500">
                        Congratulations!
                      </span>
                    </div>
                    
                    <button
                      onClick={() => {
                        setIsVisible(false)
                        setTimeout(() => {
                          setShowCelebration(false)
                          onDismiss?.()
                        }, 300)
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>

              {/* Animated Background Elements */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                  animate={{ 
                    x: [-10, 10, -10],
                    y: [-5, 5, -5],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-2 right-2"
                >
                  <Heart className="w-6 h-6 text-blush/20 fill-current" />
                </motion.div>
                
                <motion.div
                  animate={{ 
                    x: [5, -5, 5],
                    y: [2, -2, 2], 
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute bottom-2 left-2"
                >
                  <Sparkles className="w-4 h-4 text-champagne/30" />
                </motion.div>
              </div>
            </WeddingCardContent>
          </WeddingCard>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { MilestoneCelebration }