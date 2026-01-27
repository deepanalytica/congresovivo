# 🏛️ Congreso Vivo

**Dashboard inteligente del Congreso Nacional de Chile** - Visualiza proyectos de ley, votaciones, y actividad parlamentaria en tiempo real con una experiencia moderna y extraordinaria.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TU-USUARIO/congreso-vivo)

## ✨ Características

- 🎯 **Radar Semanal Legislativo** - Seguimiento de proyectos activos
- 🗺️ **Metro Map del Trámite** - Visualización del proceso legislativo
- 👥 **Mapa de Parlamentarios** - Distribución por ideología, partido y bancada
- 📊 **Analytics en Tiempo Real** - Estadísticas y tendencias
- 🔍 **Búsqueda Avanzada** - Full-text search instantánea
- 🌙 **Dark Glassmorphism UI** - Diseño premium y moderno

## 🚀 Demo

- **Producción**: [congreso-vivo.vercel.app](https://congreso-vivo.vercel.app) *(próximamente)*
- **Datos**: [Open Data Cámara](https://opendata.camara.cl/) | [Senado](https://tramitacion.senado.cl/)

## 📋 Prerequisitos

- Node.js 18+ 
- pnpm 8+ (recomendado) o npm
- Cuenta GitHub
- Cuenta Vercel (gratis)
- Cuenta Supabase (gratis)

## 🛠️ Instalación Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU-USUARIO/congreso-vivo.git
cd congreso-vivo
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

```bash
# Copiar el template
cp .env.example .env.local

# Editar .env.local con tus credenciales
# Necesitas crear un proyecto en Supabase primero
```

### 4. Setup Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ejecutar el schema:
   ```bash
   # Copiar el contenido de supabase/schema.sql
   # Pegarlo en el SQL Editor de Supabase
   ```
3. Copiar URL y API Keys a `.env.local`

### 5. Ejecutar en desarrollo

```bash
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy en Vercel

### Opción 1: Deploy Automático (Recomendado)

1. **Subir a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/congreso-vivo.git
   git push -u origin main
   ```

2. **Deploy en Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Importa tu repositorio GitHub
   - Vercel detectará Next.js automáticamente
   - **Configura las variables de entorno** desde el dashboard
   - Click "Deploy"

3. **Configurar Variables de Entorno en Vercel**
   - Settings → Environment Variables
   - Añade todas las variables de `.env.example`
   - ⚠️ Asegúrate de añadir `SUPABASE_SERVICE_ROLE_KEY` como **secreta**

4. **Activar Cron Job**
   - El archivo `vercel.json` ya tiene la configuración
   - Vercel ejecutará `/api/etl/sync` cada hora automáticamente
   - Verifica en Dashboard → Cron Jobs

### Opción 2: Deploy con CLI

```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# Configurar variables de entorno
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... etc

# Deploy a producción
vercel --prod
```

## 📊 Pipeline de Datos (ETL)

### Arquitectura

```
[APIs XML Oficiales]
    ↓ Cron Job (cada 1 hora)
[ETL Pipeline]
    ↓
[Supabase PostgreSQL]
    ↓ Lectura rápida
[Dashboard Next.js]
```

### Sincronización Manual

Puedes triggear una sincronización manual:

```bash
curl -X POST https://tu-app.vercel.app/api/etl/sync \
  -H "x-api-key: tu-etl-api-key"
```

### Frecuencia de Sync (configurada en `vercel.json`)

- **Parlamentarios**: 1x/día (cambian poco)
- **Proyectos**: Cada 1 hora
- **Votaciones**: Cada hora durante sesiones

## 🗂️ Estructura del Proyecto

```
congreso-vivo/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API Routes
│   │   │   ├── bills/    # /api/bills
│   │   │   ├── stats/    # /api/stats
│   │   │   └── etl/      # /api/etl/sync (cron)
│   │   ├── page.tsx      # Homepage (Radar)
│   │   └── globals.css   # Estilos globales
│   ├── components/       # React Components
│   │   ├── ui/           # Components base (shadcn)
│   │   └── legislature/  # Components específicos
│   ├── lib/
│   │   ├── api/          # Clientes API y ETL
│   │   ├── data/         # Mock data
│   │   └── utils/        # Utilidades
│   └── types/            # TypeScript types
├── supabase/
│   └── schema.sql        # Database schema
├── docs/                 # Documentación
├── vercel.json           # Configuración Vercel + Cron
└── package.json
```

## 🔑 Variables de Entorno

Ver `.env.example` para la lista completa.

**Requeridas:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Opcionales:**
- `ETL_API_KEY` - Proteger endpoint ETL
- `UPSTASH_REDIS_REST_URL` - Cache Redis
- `UPSTASH_REDIS_REST_TOKEN`

## 🧪 Scripts Disponibles

```bash
pnpm dev          # Desarrollo local
pnpm build        # Build de producción
pnpm start        # Ejecutar build
pnpm lint         # ESLint
pnpm type-check   # TypeScript check
```

## 📈 Roadmap

- [x] Fase 0: Setup y diseño
- [x] Fase 1: ETL Pipeline
- [x] Fase 2: Dashboard MVP
- [ ] Fase 3: Metro Map visualización
- [ ] Fase 4: Mapa de Parlamentarios (D3.js)
- [ ] Fase 5: Búsqueda avanzada
- [ ] Fase 6: Versión PRO (alertas, exportaciones)

## 🛡️ Tecnologías

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript (strict mode)
- **Estilos**: Tailwind CSS v3, shadcn/ui
- **Base de Datos**: Supabase (PostgreSQL)
- **Cache**: Upstash Redis (opcional)
- **Visualizaciones**: Recharts, D3.js
- **Animaciones**: Framer Motion
- **Deployment**: Vercel
- **Fuentes de Datos**: Open Data Congreso (APIs XML oficiales)

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Contacto

- Email: contacto@mirefugioenelcampo.cl
- Proyecto: [GitHub - Congreso Vivo](https://github.com/TU-USUARIO/congreso-vivo)

## 🙏 Agradecimientos

- [Open Data Cámara de Diputados](https://opendata.camara.cl/)
- [Senado de Chile - Tramitación](https://tramitacion.senado.cl/)
- [Biblioteca del Congreso Nacional](https://www.bcn.cl/)

---

Hecho con ❤️ para la transparencia legislativa en Chile
