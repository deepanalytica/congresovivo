import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Institutional colors
                congreso: {
                    blue: '#003366',
                    lightblue: '#0066CC',
                },
                senado: {
                    red: '#8B0000',
                    lightred: '#DC143C',
                },
                camara: {
                    green: '#006400',
                    lightgreen: '#228B22',
                },

                // Legislative stages
                stage: {
                    ingreso: '#3B82F6', // blue
                    comision: '#F59E0B', // amber
                    sala: '#8B5CF6', // violet
                    aprobado: '#10B981', // green
                    rechazado: '#EF4444', // red
                    archivado: '#6B7280', // gray
                },

                // Urgency levels
                urgency: {
                    simple: '#FBBF24', // yellow
                    suma: '#F97316', // orange
                    inmediata: '#DC2626', // red
                },

                // Political spectrum (for parlamentarian visualization)
                ideology: {
                    left: '#E11D48', // rose-red
                    center: '#8B5CF6', // violet
                    right: '#0EA5E9', // sky-blue
                },
            },
            fontFamily: {
                sans: ['var(--font-inter)'],
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'pulse-subtle': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.3s ease-in-out',
                'slide-up': 'slide-up 0.4s ease-out',
                'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}

export default config
