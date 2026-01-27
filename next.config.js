/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['opendata.camara.cl', 'tramitacion.senado.cl', 'www.bcn.cl'],
    },
    experimental: {
        optimizePackageImports: ['lucide-react', 'recharts', 'd3'],
    },
}

module.exports = nextConfig
