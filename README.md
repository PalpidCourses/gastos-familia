# Gastos Familiares 🏠💰

Gestión de gastos familiares - Web multitenant con Node.js backend y React frontend.

## Arquitectura

```
┌─────────────────────────────────────────┐
│          React SPA (Frontend)         │
│         (Netlify / Cloudflare)        │
└──────────────┬──────────────────────────┘
               │
               │ HTTP/REST API
               │
┌──────────────▼──────────────────────────┐
│         Node.js Backend                │
│    (Express + Multitenancy)           │
└──────────────┬──────────────────────────┘
               │
               │
┌──────────────▼──────────────────────────┐
│         Base de Datos                  │
│   (PostgreSQL / MongoDB)               │
└─────────────────────────────────────────┘
```

## Características Principales

- ✅ Multitenancy (varias familias en mismo sistema)
- ✅ Gestión de gastos e ingresos
- ✅ Categorías y subcategorías
- ✅ Presupuestos por categoría
- ✅ Dashboard con estadísticas
- ✅ Exportación de datos
- ✅ Usuarios por familia con roles (admin, editor, visualizador)

## Stack Tecnológico

| Capa | Tecnología |
|-------|-----------|
| Frontend | React + Vite |
| Deployment Frontend | Netlify / Cloudflare Pages |
| Backend | Node.js + Express |
| Base de Datos | PostgreSQL (recomendado) o MongoDB |
| Auth | JWT / OAuth |

## Estructura del Proyecto

```
gastos-familiares/
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
│   │   └── utils/       # Helpers
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Issues y Roadmap

Ver issues en el repositorio para el estado de desarrollo.

## Deploy

- **Backend:** VPS o servidor con Node.js
- **Frontend:** Netlify o Cloudflare Pages (build estático)

---

*Proyecto de gestión de gastos familiares - 2026*
