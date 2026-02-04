# Gastos Familia 🏠💰

Gestión de gastos familiar con escaneo inteligente de tickets, conciliación bancaria automática y reparto familiar.

---

## Análisis de PRD y Prototipos 🧙

**Fecha revisión:** 2026-02-04

### ✅ Fortalezas

**PRD:**
1. **Visión clara y diferenciada** — Escaneo IA + multicanal + conciliación 3 niveles + Reparto familiar
2. **Personas bien definidas** — Objetivos y frustraciones claros por rol (Padre Admin, Madre Colaboradora, Hijos)
3. **Historias de usuario completas** — Criterios de aceptación medibles (tiempos, confirmación, validación)
4. **Métricas de éxito KPIs claros** — >90% precisión, >80% retención, DAU/WAU, etc.
5. **Plan de fases realista** — MVP primero, features secundarias después

**UX/UI:**
1. **Design System completo** — Tokens, tipografía, espaciado, radios, shadows bien definidos
2. **Componentes modulares** — Button, Input, Card, Toast, Drawer, Badge, DonutChart bien especificados
3. **Mobile First** — Bottom nav en móvil, sidebar en desktop, responsive bien pensado
4. **Accesibilidad** — WCAG Level A, atajos de teclado, ARIA, focus states
5. **v0.dev design translation** — Muy útil para implementar

### ⚠️ Posibles Mejoras

#### 1. **Flujo del Bot (Demasiado largo)**
**Problema:** El flujo de chat/voz tiene 10 pasos. Es mucho para una interacción móvil rápida.

**Sugerencia:** Reducir a 3-4 pasos máximo:
```
1. Usuario envía: "gasto 5€ coca cola"
2. IA responde con propuesta completa (todo pre-rellenado)
3. Usuario: [✅ Confirmar] o [✏️ Editar]
```

**Por qué:** Los usuarios abandonarán si tienen que responder 8 preguntas.

#### 2. **Multitenancia (Falta especificación técnica)**
**Pregunta:** ¿Cómo se aíslan los datos por familia en la DB?

**Opciones:**
1. **Schema por tenant** — Cada familia tiene su propia BD (más seguro, más complejo)
2. **Single schema + `tenant_id`** — Más simple, queries más complejas
3. **Row-Level Security (RLS)** — PostgreSQL (seguro, performante)

**Recomendación:** PostgreSQL RLS con `tenant_id` como columna global.

#### 3. **Offline Mode (Mencionado pero no especificado)**
**Pregunta:** ¿Qué pasa cuando no hay conexión?

**Casos a cubrir:**
- ¿El bot sigue recibiendo mensajes?
- ¿Se cachean los gastos localmente (PWA)?
- ¿Se sincroniza automáticamente cuando hay red?

**Sugerencia:** Implementar PWA con IndexedDB para caché local.

#### 4. **Gastos grandes (Falta validación)**
**Problema:** No se especifica qué pasa con gastos >500€.

**Recomendación:**
- Confirmación especial para gastos >100€ (modal con "¿Seguro?")
- Notificación a todos los miembros
- Log de auditoría para gastos grandes

#### 5. **Conciliación 3 niveles (Muy ambicioso)**
**Problema:** Matching Ticket → Visa → Extracto es muy complejo técnicamente.

**Sugerencia:** Empezar con 2 niveles:
- MVP: Ticket ↔ Extracto (match por importe + fecha)
- Fase 2: Agregar Ticket Visa como nivel intermedio

**Por qué:** El nivel intermedio (Ticket Visa) requiere OCR adicional y aumenta complejidad.

---

## 📊 Estimación de Complejidad

| Característica | Complejidad | Nota |
|---------------|---------------|-------|
| Auth + Roles | Media | ✅ Estándar |
| Registro por foto (IA) | Alta | ⚠️ Vision API + procesamiento |
| Bot Telegram/WhatsApp | Alta | ⚠️ 2 APIs, conversational UI |
| Conciliación 2 niveles | Muy Alta | 🔴 Matching complejo |
| Dashboard + Gráficos | Media | ✅ Estándar |
| Reportes automáticos | Media | ✅ Cron jobs |

**Recomendación:** Dividir MVP en 2-3 sprints:
- Sprint 1: Auth + Registro básico + Dashboard
- Sprint 2: Bot + IA Vision
- Sprint 3: Conciliación básica

---

## 🎯 Stack Tecnológico — OK

| Capa | Tech | Opinión |
|--------|------|----------|
| Frontend | React + Vite | ✅ Excelente elección |
| Backend | Node.js | ✅ Adecuado |
| DB | PostgreSQL | ✅ Mejor opción para multitenancy |
| IA | Agnóstico (GLM/OpenAI) | ✅ Migración fácil |
| Bots | Telegram + WhatsApp | ✅ Telegram gratis, WhatsApp pago |

**Sugerencia adicional:**
- **Redis** — Para caché de conciliación y colas
- **Bull** — Para procesamiento asíncrono de tickets
- **Docker Compose** — Para despliegue local fácil

---

## 🔧 Arquitectura Multitenante

```
PostgreSQL RLS (Row-Level Security):

CREATE POLICY tenant_isolation ON expenses
FOR SELECT
USING (tenant_id = current_tenant_id());

-- Cada query incluye automáticamente WHERE tenant_id
```

**Ventajas:**
- Seguro por defecto (no se puede olvidar)
- Performante (índice en tenant_id)
- Simple en queries (no WHERE manual)

---

## 📋 Plan de Implementación Sugerido

### Sprint 1 (Fundaciones)
1. **Backend skeleton** — Node.js + Express + PostgreSQL
2. **Auth + Roles** — JWT + bcrypt + RLS
3. **Frontend skeleton** — React + Vite + Design System
4. **Docker Compose** — Despliegue local

### Sprint 2 (Core Expenses)
1. **Formulario básico** — Registro manual
2. **Dashboard** — Métricas + tabla
3. **Categorías** — CRUD básico
4. **Miembros** — Gestión básica

### Sprint 3 (IA + Bot)
1. **Telegram Bot skeleton** — Webhook + comandos
2. **IA Vision** — Integración GLM/OpenAI
3. **Extracción tickets** — OCR básico
4. **Flujo conversacional reducido** — 3-4 pasos máximo

### Sprint 4 (Conciliación)
1. **Upload extractos** — PDF parsing
2. **Matching básico** — Importe + fecha
3. **Incidencias** — Manual review
4. **Reportes** — Semanal automático

---

## 💬 Preguntas Abiertas

1. **Proveedores de IA:** ¿Empezamos con GLM (gratis/gratis) o directamente OpenAI GPT-4o (mejor visión pero más caro)?

2. **WhatsApp vs Telegram:** ¿Prioridad? WhatsApp requiere API de pago, Telegram es gratis.

3. **Tiempo de retención de tickets:** ¿Guardamos imágenes por 3 años? ¿O hasta confirmación?

4. **Métricas:** ¿Qué herramienta usamos? Metabase, Mixpanel, o custom analytics?

5. **MVP feature scope:** ¿Queremos conciliación en MVP o lo dejamos para Sprint 4?

---

## 🎁 Prototipos HTML

Los prototipos HTML están disponibles en `docs/prototipos/`:

| Prototipo | Descripción |
|-----------|-------------|
| Dashboard | Vista principal con sidebar, donut chart, gastos recurrentes |
| Lista de Gastos Completa | Tabla de gastos con filas expandibles, filtros |
| Drawer "Nuevo Gasto" | Drawer lateral con formulario de secciones colapsables |
| Inbox de Conciliación | Bandeja de entrada de conciliación con casos |
| Miembros & Roles | Grid de tarjetas de miembros con roles |
| Login | Pantalla de registro/login |
| Edición de Gasto | Formulario para editar gasto existente |
| Registro Familia | Pantalla para unirse a una familia |

---

## 📐 Estructura del Proyecto

```
gastos-familia/
├── backend/              # Node.js API
│   ├── src/
│   │   ├── models/      # Modelos de datos
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── routes/      # Endpoints API
│   │   ├── middleware/   # Auth, multitenancy
│   │   └── utils/       # Utilidades
│   ├── package.json
│   └── .env.example
├── frontend/            # React SPA
│   ├── src/
│   │   ├── components/  # Componentes UI
│   │   ├── pages/       # Páginas
│   │   ├── services/    # API calls
│   │   ├── styles/      # Design System (Tailwind)
│   │   └── types/       # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── README.md
└── docs/
    └── prototipos/  # Prototipos HTML
```

---

## 🚀 Características

- ✅ Multitenancy (varias familias en mismo sistema)
- ✅ Escaneo IA de tickets
- ✅ Registro por foto/texto/voz
- ✅ Conciliación bancaria automática
- ✅ Reparto familiar con carga económica
- ✅ Dashboard con métricas y gráficos
- ✅ Bots (Telegram + WhatsApp)
- ✅ Reportes automáticos semanales
- ✅ Roles de usuario (Admin, Padre/Madre, Hijo)

---

## Stack Tecnológico

| Capa | Tecnología |
|-------|-----------|
| Frontend | React + Vite + TypeScript |
| Backend | Node.js + Express |
| Base de Datos | PostgreSQL (RLS para multitenancy) |
| IA/Vision | GLM (inicial) → Migrable a OpenAI/Anthropic |
| Bots | Telegram Bot API, WhatsApp Business API |
| Deploy | Docker Compose + Cloudflare Pages (frontend) |

---

## Issues en el Repositorio

Ver issues en el repositorio para el estado de desarrollo.

---

*Proyecto de gestión de gastos familiares - 2026* 🧙
