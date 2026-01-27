# Análisis de Open Data del Congreso Nacional de Chile

## Endpoints Disponibles

### Cámara de Diputados (opendata.camara.cl)

#### Diputados
- **Diputados Vigentes**: `https://opendata.camara.cl/wscamaradiputados.asmx/getDiputados_Vigentes`
- **Diputados por Período**: `https://opendata.camara.cl/wscamaradiputados.asmx/getDiputados_Periodo`

**Estructura de Datos (inferida)**:
```xml
<Diputados>
  <Diputado>
    <ID>...</ID>
    <NOMBRE>...</NOMBRE>
    <APELLIDO_PATERNO>...</APELLIDO_PATERNO>
    <APELLIDO_MATERNO>...</APELLIDO_MATERNO>
    <PARTIDO>...</PARTIDO>
    <REGION>...</REGION>
    <DISTRITO>...</DISTRITO>
    <EMAIL>...</EMAIL>
    ...
  </Diputado>
</Diputados>
```

#### Votaciones
- **Votación por Boletín**: `https://opendata.camara.cl/pages/votacion_boletin.aspx`
- **Votación Detalle**: `https://opendata.camara.cl/pages/votacion_detalle.aspx`

**Estructura de Datos**:
```xml
<Votaciones>
  <Votacion>
    <ID>16197</ID>
    <FECHA>...</FECHA>
    <MATERIA>...</MATERIA>
    <RESULTADO>...</RESULTADO>
    ...
  </Votacion>
</Votaciones>
```

#### Sesiones
- **Sesiones de Sala**: `https://opendata.camara.cl/pages/sesiones.aspx`
- **Sesión Detalle**: `https://opendata.camara.cl/pages/sesion_detalle.aspx`
- **Boletín de Sesión**: `https://opendata.camara.cl/pages/sesion_boletin.aspx`

#### Comisiones
- **Comisiones Vigentes**: `https://opendata.camara.cl/pages/comisiones_vigentes.aspx`

#### Períodos Legislativos
- **Período Actual**: `https://opendata.camara.cl/pages/periodo_actual.aspx`
- **Períodos Legislativos**: `https://opendata.camara.cl/pages/periodos.aspx`
- **Legislaturas**: `https://opendata.camara.cl/pages/legislaturas.aspx`
- **Legislatura Actual**: `https://opendata.camara.cl/pages/legislatura_actual.aspx`

---

### Senado (tramitacion.senado.cl)

#### Senadores
- **Senadores Vigentes**: `https://tramitacion.senado.cl/wspublico/senadores_vigentes.php`

**Estructura de Datos** (CONFIRMADA):
```xml
<senadores>
  <senador>
    <PARLID>1221</PARLID>
    <PARLAPELLIDOPATERNO>Aravena</PARLAPELLIDOPATERNO>
    <PARLAPELLIDOMATERNO>Acuña</PARLAPELLIDOMATERNO>
    <PARLNOMBRE>Carmen Gloria</PARLNOMBRE>
    <REGION>Región de La Araucanía</REGION>
    <CIRCUNSCRIPCION>11</CIRCUNSCRIPCION>
    <PARTIDO>Independiente</PARTIDO>
    <FONO>(56-32) 2504751</FONO>
    <EMAIL>cgloriaaravena@senado.cl</EMAIL>
    <CURRICULUM>http://www.senado.cl/curriculum...</CURRICULUM>
  </senador>
  ...
</senadores>
```

**Partidos detectados en el XML**:
- P.C (Partido Comunista) - Izquierda
- F.R.E.V.S. (Frente Regionalista Verde Social) - Izquierda
- P.S. (Partido Socialista) - Centro-Izquierda
- P.P.D. (Partido por la Democracia) - Centro-Izquierda
- Revolución Democrática - Centro-Izquierda
- P.D.C. (Partido Demócrata Cristiano) - Centro
- Demócratas - Centro
- Social Cristiano - Centro
- Evópoli - Centro-Derecha
- R.N. (Renovación Nacional) - Derecha
- U.D.I. (Unión Demócrata Independiente) - Derecha
- Independiente - Variable

#### Proyectos de Ley
- **Proyectos de Ley**: `https://tramitacion.senado.cl/wspublico/invoca_proyecto.html`
- **Listado con Movimiento desde Fecha**: `https://tramitacion.senado.cl/wspublico/invoca_tramitacion_fecha.html`

#### Votaciones
- **Votaciones por Boletín (Senado)**: `https://tramitacion.senado.cl/wspublico/invoca_votacion.html`

#### Sesiones
- **Sesiones de Sala**: `https://tramitacion.senado.cl/wspublico/invoca_sesion.html`
- **Diario de Sesión**: `https://tramitacion.senado.cl/wspublico/invoca_diario.html`

#### Comisiones
- **Comisiones Vigentes**: `https://tramitacion.senado.cl/wspublico/comisiones.php`

---

### Biblioteca del Congreso Nacional (BCN)

- **Leyes más solicitadas**: `https://www.bcn.cl/leychile/consulta/legislacion_abierta_web_service`
- **Metadatos de norma**: `https://www.bcn.cl/leychile/consulta/legislacion_abierta_web_service`
- **XML completo de norma**: `https://www.bcn.cl/leychile/consulta/legislacion_abierta_web_service`

---

## Estrategia de Extracción

### Fase 1: MVP con Datos Mock
Para el MVP inicial, usaremos datos mock estructurados que repliquen la estructura XML real. Esto nos permite:
1. Desarrollar la UI y visualizaciones rápidamente
2. Definir los tipos TypeScript correctos
3. Probar la UX sin depender de la disponibilidad de los endpoints

### Fase 2: ETL Real
Una vez validado el MVP, implementaremos un pipeline ETL:

```typescript
// ETL Pipeline
1. Fetch XML desde endpoints
2. Parse XML → JSON con validación de esquema
3. Transform: normalizar datos, calcular ideología desde partido
4. Load: insertar en Postgres (Supabase)
5. Cache: precalcular agregados y guardar en Redis
6. Index: indexar en Meilisearch para búsqueda full-text
```

#### Scheduler
- Datos de parlamentarios: actualizar 1x/día (cambian muy poco)
- Proyectos con movimiento: actualizar cada hora
- Votaciones: actualizar cada 2 horas durante sesión, 1x/día fuera de sesión
- Sesiones: actualizar cada 30 min durante horario de sesión

---

## Visualización de Parlamentarios

### Datos Necesarios
Para la visualización avanzada de parlamentarios por bancada, partido e ideología, necesitamos:

1. **Desde XML**:
   - ID, Nombre completo
   - Partido (campo `<PARTIDO>`)
   - Región / Circunscripción / Distrito
   - Email, teléfono

2. **Calculado**:
   - Ideología política (mapeo partido → ideología en `design-tokens.ts`)
   - Bloque político (agrupación de partidos afines)
   - Color visual (basado en ideología)

3. **Desde votaciones** (para correlaciones):
   - Historial de votos
   - Alineamiento con bancada
   - Votos "pivote" o quiebres
   - Patrones de coalición

### Patrón de Visualización
```
┌─────────────────────────────────────────────┐
│         Mapa de Parlamentarios              │
│                                             │
│  [Izquierda]  [Centro]  [Derecha]          │
│   🔴 🔴 🔴    🟣 🟣 🟣    🔵 🔵 🔵         │
│   🔴 🔴       🟣 🟣       🔵 🔵 🔵         │
│   🔴          🟣          🔵 🔵             │
│                                             │
│  Hover: Muestra nombre, partido, región    │
│  Click: Abre perfil con historial de votos │
│                                             │
│  Filtros: Por cámara, región, bloque       │
└─────────────────────────────────────────────┘
```

Implementación con D3.js force-directed graph o grid layout con agrupación visual.

---

## Próximos Pasos Técnicos

1. ✅ Crear tipos TypeScript (`legislature.ts`)
2. ✅ Mapeo partido → ideología (`design-tokens.ts`)
3. ⬜ Crear datos mock basados en estructura XML real
4. ⬜ Implementar componente `ParliamentarianMap` (D3)
5. ⬜ Implementar ETL real (fetch + parse XML)
6. ⬜ Setup Supabase schema
7. ⬜ Implementar cache layer con Redis
