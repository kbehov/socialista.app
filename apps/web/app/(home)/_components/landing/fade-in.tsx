'use client'

import { cn } from '@/lib/utils'
import { motion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'

const easeOut = [0.22, 1, 0.36, 1] as const

const fadeTransition = { type: 'spring' as const, bounce: 0, duration: 0.45 }

type FadeInProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  /** Animate on mount instead of when scrolled into view (hero / above-fold). */
  immediate?: boolean
} & Omit<HTMLMotionProps<'div'>, 'children'>

export function FadeIn({
  children,
  className,
  delay = 0,
  y = 8,
  immediate = false,
  ...props
}: FadeInProps) {
  if (immediate) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, y }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...fadeTransition, delay }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ ...fadeTransition, delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

type StaggerProps = {
  children: ReactNode
  className?: string
  delay?: number
  stagger?: number
  immediate?: boolean
}

export function Stagger({
  children,
  className,
  delay = 0,
  stagger = 0.06,
  immediate = false,
}: StaggerProps) {
  const variants = {
    hidden: {},
    show: {
      transition: {
        delayChildren: delay,
        staggerChildren: stagger,
      },
    },
  }

  if (immediate) {
    return (
      <motion.div className={cn(className)} initial="hidden" animate="show" variants={variants}>
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
  y = 8,
}: {
  children: ReactNode
  className?: string
  y?: number
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: fadeTransition,
        },
      }}
    >
      {children}
    </motion.div>
  )
}
