export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es" suppressHydrationWarning>
            <head>
                <title>Congreso Vivo - Dashboard Legislativo de Chile</title>
                <meta name="description" content="Dashboard interactivo del Congreso Nacional de Chile. Explora proyectos de ley, votaciones, sesiones y más con datos abiertos oficiales." />
                <meta property="og:title" content="Congreso Vivo - Dashboard Legislativo" />
                <meta property="og:description" content="Visualización inteligente y verificable del Congreso de Chile" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body>
                {children}
            </body>
        </html>
    )
}
