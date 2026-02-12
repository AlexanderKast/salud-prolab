# Salud ProLab - Plataforma Drop

Plataforma SaaS de proveeduría dropshipping para el mercado hispano (Colombia/Ecuador).

## Stack

- **Monorepo**: Turborepo + pnpm
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 16 + Prisma 6
- **Auth**: NextAuth v5 (Auth.js) + Credentials + JWT + RBAC
- **Storage**: S3 compatible (MinIO local)
- **Validación**: Zod (compartido front/back)
- **Data Fetching**: TanStack React Query

## Quick Start

### Requisitos

- Node.js >= 20
- pnpm >= 10
- Docker + Docker Compose
- PostgreSQL 16 (o via Docker)

### Instalación

```bash
# 1. Clonar el repositorio
git clone <repo-url> salud-prolab
cd salud-prolab

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Levantar servicios (Postgres + MinIO)
docker compose up -d

# 5. Generar cliente Prisma
pnpm db:generate

# 6. Ejecutar migraciones
pnpm db:migrate

# 7. Poblar datos de prueba
pnpm db:seed

# 8. Iniciar desarrollo
pnpm dev
```

La app estará disponible en http://localhost:3000

### Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| SUPER_ADMIN | admin@saludprolab.com | Admin123! |
| ADMIN | manager@saludprolab.com | Manager123! |
| ANALYST | analista@saludprolab.com | Analyst123! |
| DROPSHIPPER | tienda@ejemplo.com | Drop123! |

## Estructura del Proyecto

```
salud-prolab/
├── apps/web/                    # Next.js app (frontend + API)
│   ├── src/app/                 # Pages + API routes
│   │   ├── (auth)/login/        # Login
│   │   ├── (dashboard)/         # Catálogo, Research, Marketing, Perfil
│   │   ├── (admin)/admin/       # Admin CRUD
│   │   └── api/                 # API route handlers
│   ├── src/components/          # UI components
│   ├── src/lib/                 # Auth, RBAC, Rate Limit, S3, Env
│   ├── src/hooks/               # React Query hooks
│   └── src/middleware.ts        # RBAC middleware
├── packages/database/           # Prisma schema + client + seeds
├── packages/shared/             # Zod schemas, tipos, constantes, utils
├── docs/                        # Documentación
├── docker-compose.yml           # Postgres + MinIO
├── turbo.json
└── pnpm-workspace.yaml
```

## Scripts

```bash
pnpm dev          # Iniciar desarrollo
pnpm build        # Build de producción
pnpm lint         # Ejecutar ESLint
pnpm format       # Formatear código
pnpm format:check # Verificar formato
pnpm type-check   # Verificar tipos TypeScript
pnpm db:generate  # Generar cliente Prisma
pnpm db:migrate   # Ejecutar migraciones
pnpm db:push      # Push schema a DB (sin migración)
pnpm db:seed      # Poblar datos de prueba
pnpm db:studio    # Abrir Prisma Studio
```

## Módulos

### Catálogo
- Grid de productos con filtros avanzados
- Ficha de producto con tabs: General, Variantes, Disponibilidad, Materiales, Research, Marketing, FAQs, Restricciones
- Disponibilidad por país (Colombia, Ecuador)

### Centro de Investigación
- Notas de investigación de mercado
- Benchmarks de competidores
- Investigación Express con templates

### Hub de Marketing
- Playbooks con metodología ESFERA (Estrategia, Segmentos, Funnel, Ejecución, Recursos, Análisis)
- Plantillas (Email, Social, WhatsApp, Landing, Ads)

### Administración
- CRUD de usuarios con roles
- Gestión de proveedores, categorías, países
- Log de auditoría

## Roles y Permisos

| Rol | Acceso |
|-----|--------|
| SUPER_ADMIN | Todo |
| ADMIN | Productos, Research, Marketing, Usuarios, Proveedores, Auditoría |
| ANALYST | Lectura productos + CRUD Research + Lectura Marketing |
| DROPSHIPPER | Lectura catálogo/research/marketing + Colecciones propias |
| GUEST | Solo lectura catálogo |

## Variables de Entorno

Ver `.env.example` para la lista completa.
