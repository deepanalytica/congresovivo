"use client"

import { useEffect, useState } from 'react'

export function CountUp({ end, duration = 2000, suffix = '' }: { end: number, duration?: number, suffix?: string }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let startTime: number
        let animationFrame: number

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime
            const progress = currentTime - startTime

            if (progress < duration) {
                const percentage = Math.pow(progress / duration, 3) // Ease out cubic
                setCount(Math.floor(end * percentage))
                animationFrame = requestAnimationFrame(animate)
            } else {
                setCount(end)
            }
        }

        animationFrame = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animationFrame)
    }, [end, duration])

    return <>{count}{suffix}</>
}
