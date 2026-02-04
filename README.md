# Gastos Familia 🏠💰

Sistema de gestión de gastos familiar con escaneo inteligente de tickets, conciliación bancaria automática y reparto familiar.

## 🚀 Inicio Rápido

```bash
# 1. Clonar el repositorio
git clone https://github.com/PalpidCourses/gastos-familia.git
cd gastos-familia

# 2. Iniciar servicios con Docker
docker-compose up -d

# 3. Instalar dependencias
cd backend
npm install

cd ../frontend
npm install

# 4. Iniciar desarrollo
# Backend (con hot reload)
npm run dev

# Frontend (Vite dev server)
npm run dev
```

## 📁 Estructura del Proyecto

```
gastos-familia/
├── backend/              # Node.js API
│   ├── src/
│   │   ├── index.js  # Servidor Express
│   │   └── schema.sql   # Esquema PostgreSQL
│   ├── package.json
│   ├── .env.example   # Variables de entorno
│   └── README.md       # Documentación del backend
├── frontend/            # React SPA
│   ├── src/
│   │   ├── main.jsx      # Punto de entrada
│   │   ├── App.jsx       # Rutas principales
│   │   └── pages/        # Páginas
│   │       ├── Login.jsx
│   │       └── Dashboard.jsx
│   ├── package.json
│   ├── vite.config.js   # Configuración de Vite
│   └── index.html
├── docker-compose.yml   # Composición de servicios
├── sprint1.md          # Checklist de Sprint 1
└── README.md           # Este archivo
```

## 🗄️ Base de Datos (PostgreSQL)

### Schema
- **Tenants** — Familias
- **Users** — Usuarios con roles (admin, parent, child)
- **Families** — Información de familia
- **Family Members** — Miembros con asignación
- **Categories** — Categorías de gastos
- **Merchants** — Comercios
- **Expenses** — Gastos individuales
- **Recurring Expenses** — Gastos recurrentes

### Row-Level Security (RLS)
Cada tabla incluye `tenant_id` para aislar datos por familia.
Queries incluyen automáticamente `WHERE tenant_id = current_tenant_id()`.

## 🎯 Sprint 1: Fundaciones

**Estado:** En progreso

**Backend:**
- ✅ Express server inicializado
- ✅ PostgreSQL pool configurado
- ✅ Auth routes (login, register)
- ✅ Middleware de RLS (tenant_id)
- ✅ Rutas básicas de API

**Frontend:**
- ✅ React + Vite configurado
- ✅ Tailwind CSS integrado
- ✅ React Router configurado
- ✅ Página Login creada
- ✅ Dashboard básico creado
- ✅ Navegación móvil (bottom nav) y desktop (sidebar)

**Base de Datos:**
- ✅ Schema completo con RLS
- ✅ Políticas de tenant isolation
- ✅ Índices optimizados

**Deploy:**
- ✅ Docker Compose configurado
- ✅ PostgreSQL container
- ✅ Backend container
- ✅ Frontend container

## 🔧 Configuración

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/gastosfamilia
PORT=3000
JWT_SECRET=tu_secreto_jwt_muy_largo_para_firmar_tokens
CORS_ORIGIN=*
NODE_ENV=development
```

### Frontend
```bash
VITE_API_URL=http://localhost:3000
```

### Endpoints API

| Método | Endpoint | Descripción |
|--------|-----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/expenses` | Listar gastos (con RLS) |
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login de usuario |

## 🚀 Comandos Útiles

```bash
# Backend
cd backend
npm start           # Iniciar servidor
npm run dev          # Modo desarrollo (nodemon)
npm run migrate       # Migraciones de DB (cuando exista)
npm run seed          # Insertar datos de prueba

# Frontend
cd frontend
npm run dev          # Vite dev server (puerto 5173)
npm run build        # Build para producción
npm run preview       # Preview del build
```

## 📝 Roadmap

**Sprint 1 (actual):**
- [x] Backend skeleton
- [x] Frontend skeleton
- [x] Auth + Roles
- [x] Base de datos con RLS
- [ ] Conexión real con backend
- [ ] Registro de gasto básico

**Sprint 2:**
- [ ] Bot de Telegram con GLM Vision
- [ ] Escaneo de tickets
- [ ] Extracción de datos con IA
- [ ] Flujo conversacional simplificado

**Sprint 3:**
- [ ] Conciliación básica
- [ ] Matching de tickets con extractos
- [ ] Incidencias manuales

**Sprint 4:**
- [ ] Reportes automáticos
- [ ] Gastos recurrentes
- [ ] Dashboard avanzado

## 📚 Recursos

- [React Docs](https://react.dev/)
- [Express Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Docs](https://vitejs.dev/)

## 🔐 Seguridad

- **Contraseñas** — bcrypt para hash
- **Tokens** — JWT para autenticación
- **Multitenancy** — Row-Level Security (RLS) para aislar datos por familia
- **CORS** — Configurado para desarrollo

## 📦 Dependencias Principales

### Backend
- `express` — Framework web
- `pg` — Cliente PostgreSQL
- `bcryptjs` — Hash de contraseñas
- `jsonwebtoken` — Tokens JWT
- `dotenv` — Variables de entorno
- `cors` — Middleware CORS

### Frontend
- `react` — Framework UI
- `react-router-dom` — Enrutamiento
- `axios` — Cliente HTTP
- `lucide-react` — Iconos
- `date-fns` — Fechas

---

*Proyecto Gastos Familia - 2026* 🧙
