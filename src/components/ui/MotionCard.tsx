"use client"

import React, { useRef, useState } from 'react'
import { motion, useMotionTemplate, useMotionValue, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MotionCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode
    variant?: 'default' | 'premium'
}

export function MotionCard({ children, className, variant = 'default', ...props }: MotionCardProps) {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
    }

    const spotlight = useMotionTemplate`radial-gradient(650px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.1), transparent 80%)`
    const borderHighlight = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.2), transparent 80%)`

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            onMouseMove={onMouseMove}
            className={cn(
                "group relative rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl overflow-hidden",
                variant === 'premium' && "hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]",
                className
            )}
            {...props}
        >
            {/* Dynamic Border Highlight */}
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                style={{ background: borderHighlight }}
            />

            {/* Spotlight Effect */}
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                style={{ background: spotlight }}
            />

            {/* Content */}
            <div className="relative z-10 h-full">{children}</div>
        </motion.div>
    )
}
