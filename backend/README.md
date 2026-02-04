# Backend Gastos Familia

Backend Node.js + Express + PostgreSQL con JWT Auth y multitenancy.

## 🚀 Inicio Rápido

### Desarrollo local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Arrancar servidor (con hot reload)
npm run dev

# O producción
npm start
```

### Docker

```bash
# Desde la raíz del proyecto
docker compose up -d postgres backend
```

---

## 🔐 Usuario de Prueba

Para probar la aplicación, usa estas credenciales:

| Campo | Valor |
|-------|-------|
| **Email** | `david@gastos-familia.com` |
| **Password** | `password123` |
| **Tenant** | `familia-prueba` |

Este usuario se crea automáticamente al ejecutar:
```bash
node src/scripts/seed.js
```

---

## 📡 Endpoints API

### Health
```
GET /health
```

### Auth
```
POST /api/auth/register
POST /api/auth/login
```

### Expenses
```
GET  /api/expenses
POST /api/expenses
GET  /api/expenses/:id
PUT  /api/expenses/:id
DELETE /api/expenses/:id
```

---

## 🗄️ Base de Datos

### Schema
Ver `schema.sql` para la estructura completa de tablas.

### Tablas principales
- `tenants` — Familias/organizaciones
- `users` — Usuarios con roles (admin, parent, child)
- `families` — Información de familia
- `family_members` — Miembros con asignación
- `categories` — Categorías de gastos
- `merchants` — Comercios
- `expenses` — Gastos individuales
- `recurring_expenses` — Gastos recurrentes

### Multitenancy
Todas las tablas incluyen `tenant_id` para aislar datos por familia.
El middleware de RLS filtra automáticamente por tenant_id en cada query.

---

## 🔧 Variables de Entorno

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/gastosfamilia
PORT=3000
JWT_SECRET=tu_secreto_super_seguro_muy_largo_para_firmar_tokens
CORS_ORIGIN=http://localhost:3001,http://localhost:5173,https://nono.aretaslab.tech
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

---

## 📦 Scripts

| Comando | Descripción |
|----------|-------------|
| `npm start` | Iniciar servidor (producción) |
| `npm run dev` | Iniciar servidor (desarrollo con hot reload) |
| `node src/scripts/seed.js` | Crear usuario de prueba |

---

## 🔐 Seguridad

- **Contraseñas** — bcrypt con salt rounds = 10
- **JWT** — Tokens con expiración de 7 días
- **RLS** — Row-Level Security para multitenancy
- **CORS** — Configurado para desarrollo

---

## 📚 Dependencias

### Runtime
- `express` — Framework web
- `pg` — Cliente PostgreSQL
- `bcryptjs` — Hash de contraseñas
- `jsonwebtoken` — Tokens JWT
- `dotenv` — Variables de entorno
- `cors` — Middleware CORS

### Dev
- `nodemon` — Hot reload en desarrollo

---

*Backend Gastos Familia — 2026* 🧙
