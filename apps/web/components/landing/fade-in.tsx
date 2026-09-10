'use client'

import { cn } from '@/lib/utils'
import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'

const fadeTransition = { type: 'spring' as const, bounce: 0, duration: 0.45 }

type FadeInProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
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
  const [mounted, setMounted] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    setMounted(true)
  }, [])

  const offset = reduceMotion ? 0 : y

  if (!mounted || reduceMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    )
  }

  if (immediate) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, y: offset }}
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
      initial={{ opacity: 0, y: offset }}
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
  const [mounted, setMounted] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    setMounted(true)
  }, [])

  const variants = {
    hidden: {},
    show: {
      transition: {
        delayChildren: delay,
        staggerChildren: stagger,
      },
    },
  }

  if (!mounted || reduceMotion) {
    return <div className={cn(className)}>{children}</div>
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
  const [mounted, setMounted] = useState(false)
  const reduceMotion = useReducedMotion()
  const offset = reduceMotion ? 0 : y

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: offset },
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
