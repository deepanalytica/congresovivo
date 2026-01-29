"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Map, Vote, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function MobileNav() {
    const pathname = usePathname()

    const links = [
        { href: '/', icon: Home, label: 'Inicio' },
        { href: '/votos', icon: Vote, label: 'Votaciones' },
        { href: '/mapa', icon: Map, label: 'Mapa' },
        { href: '/parlamentarios', icon: User, label: 'Personas' },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
            <div className="mx-4 mb-4 bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <nav className="flex items-center justify-around p-2">
                    {links.map(({ href, icon: Icon, label }) => {
                        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

                        return (
                            <Link
                                key={href}
                                href={href}
                                className="relative flex flex-col items-center justify-center w-full py-3"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="mobile-nav-active"
                                        className="absolute inset-0 bg-white/5 rounded-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                <Icon
                                    className={cn(
                                        "w-6 h-6 mb-1 transition-colors relative z-10",
                                        isActive ? "text-cyan-400" : "text-slate-400"
                                    )}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span className={cn(
                                    "text-[10px] font-medium transition-colors relative z-10",
                                    isActive ? "text-white" : "text-slate-500"
                                )}>
                                    {label}
                                </span>
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}
