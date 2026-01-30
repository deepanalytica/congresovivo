
"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, FileText, Vote, Users, Map, Calendar, ChevronRight, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    // Close menu on route change
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    const links = [
        { href: '/', icon: Home, label: 'Inicio' },
        { href: '/proyectos', icon: FileText, label: 'Proyectos' },
        { href: '/votos', icon: Vote, label: 'Votaciones' },
        { href: '/parlamentarios', icon: Users, label: 'Parlamentarios' },
        { href: '/comisiones', icon: Calendar, label: 'Comisiones' },
        { href: '/mapa', icon: Map, label: 'Mapa Interactivo' },
    ]

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg bg-white/10 active:scale-95 transition-transform"
                aria-label="Abrir menú"
            >
                <Menu className="text-white w-6 h-6" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-[80%] max-w-sm bg-[#0F172A] border-l border-white/10 z-[70] shadow-2xl flex flex-col"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-white/5">
                                <h2 className="font-outfit font-bold text-xl text-white">Menú</h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X className="text-slate-400 w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-4">
                                <nav className="flex flex-col px-4 gap-2">
                                    {links.map((link, i) => {
                                        const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                                        return (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                className={cn(
                                                    "flex items-center justify-between p-4 rounded-xl transition-all duration-200 group",
                                                    isActive
                                                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border border-cyan-500/30"
                                                        : "hover:bg-white/5 border border-transparent"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "p-2 rounded-lg",
                                                        isActive ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-slate-400 group-hover:text-white"
                                                    )}>
                                                        <link.icon size={20} />
                                                    </div>
                                                    <span className={cn(
                                                        "font-medium",
                                                        isActive ? "text-white" : "text-slate-300 group-hover:text-white"
                                                    )}>
                                                        {link.label}
                                                    </span>
                                                </div>
                                                <ChevronRight className={cn(
                                                    "w-4 h-4 transition-transform group-hover:translate-x-1",
                                                    isActive ? "text-cyan-400" : "text-slate-600"
                                                )} />
                                            </Link>
                                        )
                                    })}
                                </nav>

                                <div className="mt-8 px-6">
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-1.5 rounded-full bg-indigo-500 text-white">
                                                <Zap size={14} fill="currentColor" />
                                            </div>
                                            <span className="text-sm font-bold text-white">CongresoVivo Pro</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-3">Accede a análisis avanzados y alertas en tiempo real.</p>
                                        <button className="w-full py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors">
                                            Muy pronto
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/5 text-center text-xs text-slate-600">
                                © 2026 CongresoVivo
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
