'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedWrapperProps {
  children: ReactNode
}

export function AnimatedWrapper({ children }: AnimatedWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  )
}

export function FadeInWrapper({ children }: AnimatedWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  )
}
