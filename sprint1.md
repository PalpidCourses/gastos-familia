# Sprint 1: Fundaciones 🏗

**Estado:** ✅ COMPLETADO
**Inicio:** 2026-02-04
**Fin:** 2026-02-04

## Backend (Node.js + Express + PostgreSQL)

- [x] Inicializar proyecto Node.js
- [x] Configurar Express con estructura de carpetas
- [x] Configurar PostgreSQL con RLS (tenant_id)
- [x] Crear esquema de base de datos inicial
- [x] Implementar modelo de User (tenant_id, email, password hash, role)
- [x] Implementar modelo de Family (tenant_id, name, settings)
- [x] Implementar modelo de Category (tenant_id, name, color, icon)
- [x] Implementar modelo de Merchant (tenant_id, name, tags)
- [x] Configurar middleware de RLS (tenant_id en todas las queries)
- [x] Crear rutas básicas de API
- [x] Crear servidor Express

## Frontend (React + Vite + Design System)

- [x] Inicializar proyecto React con Vite
- [x] Configurar Tailwind CSS con design system del PRD
- [x] Crear estructura de carpetas (components, pages, services, styles)
- [x] Implementar tipos TypeScript básicos
- [x] Crear componentes base:
  - [x] Button (primary, secondary, danger, ghost)
  - [x] Input (text, number, date)
  - [x] Card
  - [x] Toast
  - [x] Badge
  - [x] Drawer/Modal
  - [x] DonutChart
- [x] Implementar navegación (Top Nav desktop, Bottom Nav móvil)
- [x] Crear página de Login

## Auth + Roles

- [x] Endpoint de registro (/auth/register)
- [x] Endpoint de login (/auth/login)
- [x] Middleware de autenticación JWT
- [x] bcrypt para hash de passwords
- [x] Roles por usuario (admin, parent, child)
- [x] Protección de rutas por rol

## Deploy (Docker Compose)

- [x] Crear docker-compose.yml
- [x] Configurar servicio de PostgreSQL
- [x] Configurar servicio de Node.js
- [x] Configurar volúmenes para persistencia
- [x] Crear .env.example con variables requeridas

## Scripts y Herramientas

- [x] Script de inicialización de DB
- [x] Script de seeding (datos de prueba)
- [x] npm scripts para dev/prod

---

## 📊 Resumen

**Backend:**
- Express server corriendo en puerto 3000
- PostgreSQL con Row-Level Security (RLS)
- Auth endpoints implementados
- API básica configurada

**Frontend:**
- React + Vite dev server en puerto 5173
- Login funcional (simulado)
- Dashboard básico con navegación
- Mobile-first responsive

**Base de Datos:**
- Schema completo con todas las tablas
- Multitenancy con tenant_id
- Índices optimizados

**Deploy:**
- Docker Compose configurado
- Servicios: PostgreSQL, Backend, Frontend
- Comando: `docker-compose up -d` inicia todo

---

## 🎯 Siguiente Sprint

**Sprint 2: Core Expenses**
- Formulario completo de nuevo gasto
- Dashboard con métricas reales
- Categorías CRUD
- Miembros CRUD
- Crear/Editar gastos desde UI

---

*Sprint 1 completado: Fundaciones sólidas listas para desarrollo activo*
