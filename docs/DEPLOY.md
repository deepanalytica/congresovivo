# 🚀 Guía de Deploy - Congreso Vivo en Vercel

## Paso a Paso Completo

### 📋 Pre-requisitos

Antes de empezar, asegúrate de tener:
- ✅ Cuenta GitHub (crea una en [github.com](https://github.com))
- ✅ Cuenta Vercel (crea una en [vercel.com](https://vercel.com) - usa GitHub para login)
- ✅ Cuenta Supabase (crea una en [supabase.com](https://supabase.com))
- ✅ Git instalado en tu computadora

---

## 🗄️ PASO 1: Setup Supabase (10 minutos)

### 1.1 Crear Proyecto en Supabase

1. Ve a [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Completa:
   - **Name**: `congreso-vivo`
   - **Database Password**: Genera una contraseña segura (guárdala!)
   - **Region**: South America (Brazil) - más cercano a Chile
4. Click "Create new project" (tarda ~2 minutos)

### 1.2 Ejecutar Schema SQL

1. En el dashboard de Supabase, ve a **SQL Editor** (menú izquierdo)
2. Click "New query"
3. Abre el archivo `supabase/schema.sql` de tu proyecto
4. Copia TODO el contenido
5. Pégalo en el editor SQL de Supabase
6. Click "Run" (▶️)
7. Deberías ver: ✅ "Success. No rows returned"

### 1.3 Obtener Credenciales

1. Ve a **Settings** → **API** (menú izquierdo)
2. Copia y guarda:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbG...` (clave pública)
   - **service_role key**: `eyJhbG...` (clave secreta - ⚠️ NUNCA la compartas)

---

## 📦 PASO 2: Subir a GitHub (5 minutos)

### 2.1 Crear Repositorio en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. Completa:
   - **Repository name**: `congreso-vivo`
   - **Description**: "Dashboard del Congreso Nacional de Chile"
   - **Public** o **Private** (tu elección)
3. ❌ NO marques "Add a README" (ya tienes uno)
4. Click "Create repository"

### 2.2 Subir tu Código

Abre PowerShell en la carpeta de tu proyecto y ejecuta:

```powershell
# Inicializar git (si no lo has hecho)
git init

# Añadir todos los archivos
git add .

# Commit inicial
git commit -m "Initial commit - Congreso Vivo MVP"

# Configurar rama principal
git branch -M main

# Conectar con GitHub (reemplaza TU-USUARIO)
git remote add origin https://github.com/TU-USUARIO/congreso-vivo.git

# Subir a GitHub
git push -u origin main
```

✅ Refresca GitHub - deberías ver todos tus archivos

---

## 🚀 PASO 3: Deploy en Vercel (5 minutos)

### 3.1 Importar desde GitHub

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Busca `congreso-vivo` en la lista
4. Click "Import"

### 3.2 Configurar Proyecto

En la pantalla de configuración:

1. **Framework Preset**: Next.js (detectado automáticamente)
2. **Root Directory**: `./` (dejar por defecto)
3. **Build Command**: `pnpm build` (dejar por defecto)

### 3.3 ⚠️ Añadir Variables de Entorno (IMPORTANTE)

Click "Environment Variables" y añade:

| Name | Value | Notes |
|------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Tu URL de Supabase | Desde Paso 1.3 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu anon key | Desde Paso 1.3 |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu service_role key | ⚠️ Secreta! |
| `ETL_API_KEY` | Tu clave secreta (inventa una) | Para proteger ETL |

Ejemplo de `ETL_API_KEY`: `sk_live_abc123xyz789` (inventa una segura)

### 3.4 Deploy

1. Click "Deploy"
2. ⏱️ Espera 2-3 minutos
3. ✅ Verás "Congratulations! 🎉"
4. Click "Visit" para ver tu app en vivo!

---

## ⚙️ PASO 4: Configurar Cron Job (2 minutos)

### 4.1 Verificar Configuración

1. El archivo `vercel.json` ya tiene el cron configurado
2. En el dashboard de Vercel, ve a tu proyecto
3. Click **Settings** → **Crons**
4. Deberías ver:
   - Path: `/api/etl/sync`
   - Schedule: `0 */1 * * *` (cada hora)
   - Status: ✅ Enabled

### 4.2 Primera Sincronización Manual

Para llenar la base de datos inmediatamente:

```bash
# Reemplaza con tu dominio de Vercel
curl -X POST https://tu-app.vercel.app/api/etl/sync \
  -H "x-api-key: TU_ETL_API_KEY"
```

O abre en el navegador:
```
https://tu-app.vercel.app/api/etl/sync
```

⏱️ Esto puede tardar 30-60 segundos la primera vez.

---

## ✅ PASO 5: Verificación Final

### Checklist:

- [ ] ✅ Supabase: Proyecto creado, schema ejecutado
- [ ] ✅ GitHub: Código subido y visible
- [ ] ✅ Vercel: Deploy exitoso, sin errores
- [ ] ✅ Variables de entorno: Todas configuradas
- [ ] ✅ Cron job: Activado en Vercel
- [ ] ✅ ETL sync: Primera ejecución exitosa
- [ ] ✅ Dashboard: Se ve correctamente en producción

### Tests:

1. **Verificar Dashboard**: Abre `https://tu-app.vercel.app`
   - Debería cargar en < 2 segundos
   - Fondo oscuro, animaciones funcionando
   - Sin errores en consola

2. **Verificar Datos**: 
   - Revisa que los KPIs muestren números
   - Deben aparecer proyectos de ley

3. **Verificar Supabase**:
   - Ve a Supabase → Table Editor
   - Revisa tabla `bills` - debería tener datos
   - Revisa tabla `parliamentarians` - debería tener ~200+ registros

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:

```bash
# Hacer cambios en el código...

# Git add + commit
git add .
git commit -m "Descripción de cambios"

# Push a GitHub
git push

# Vercel re-deploya automáticamente! ✨
```

---

## 🆘 Troubleshooting

### Error: "SUPABASE_URL is not defined"
**Solución**: Ve a Vercel → Settings → Environment Variables y verifica que estén añadidas.

### Error: "Failed to fetch bills"
**Solución**: 
1. Verifica que el cron job se haya ejecutado
2. Ejecuta manualmente `/api/etl/sync`
3. Revisa logs en Vercel → Functions → Logs

### Error: "Database connection failed"
**Solución**:
1. Verifica que el schema SQL se ejecutó correctamente en Supabase
2. Revisa que las credenciales sean correctas
3. Chequea que el proyecto Supabase esté "Active"

### El cron job no se ejecuta
**Solución**:
1. Vercel Hobby plan tiene límite de 1 cron job
2. Verifica en Settings → Crons que esté enabled
3. Los cron jobs solo funcionan en producción (no en preview)

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel → Functions
2. Revisa los logs en Supabase → Logs
3. Crea un issue en GitHub

---

## 🎉 ¡Listo!

Tu dashboard está en vivo en: `https://congreso-vivo.vercel.app`

Próximos pasos recomendados:
- Configura un dominio custom (ej: `congreso-vivo.cl`)
- Activa Vercel Analytics (gratis)
- Configura alertas de uptime

¡Felicitaciones! 🚀
