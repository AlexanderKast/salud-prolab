# Arquitectura - Salud ProLab

## Decisión: Next.js API Routes (no NestJS)

Para el MVP, Next.js API Routes simplifica enormemente:
- Un solo despliegue (frontend + API)
- Tipos TypeScript compartidos sin pipeline extra
- NextAuth nativo con middleware
- Velocidad de desarrollo para equipo pequeño
- Migración a NestJS posible después (lógica de negocio en `packages/shared`)

## Stack Técnico

| Capa | Tecnología |
|------|-----------|
| Monorepo | Turborepo + pnpm |
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 |
| UI Components | shadcn/ui (manual) + Lucide Icons |
| Backend | Next.js API Routes |
| Database | PostgreSQL 16 + Prisma 6 |
| Auth | NextAuth v5 + Credentials + JWT |
| Storage | S3 compatible (MinIO local) |
| Validación | Zod (compartido front/back) |
| Data Fetching | TanStack React Query v5 |
| CI/CD | GitHub Actions |

## Estructura de Paquetes

### `apps/web`
Aplicación Next.js principal. Contiene tanto el frontend como las API Routes.
- `src/app/` - Pages y API routes (App Router)
- `src/components/` - Componentes UI organizados por módulo
- `src/hooks/` - Custom hooks con React Query
- `src/lib/` - Utilidades del servidor (auth, rbac, s3, rate-limit)
- `src/middleware.ts` - Protección de rutas por rol

### `packages/database`
Prisma schema, cliente singleton, seeds.
- Schema con 20+ tablas
- Singleton pattern para PrismaClient
- Seed con datos realistas

### `packages/shared`
Código compartido entre frontend y backend.
- Zod schemas para validación
- Constantes (roles, permisos, países, monedas)
- Utilidades (formatPrice, slugify)

## Autenticación y Autorización

### Flow
1. Usuario envía credenciales a `/api/auth/callback/credentials`
2. NextAuth valida contra DB (bcrypt)
3. JWT emitido con `userId` + `role`
4. Middleware intercepta requests y verifica JWT
5. API routes usan `requirePermission()` para permisos granulares

### Matriz RBAC
Definida en `packages/shared/src/constants/roles.ts`. Cada rol tiene un array de permisos como `products:read`, `research:write`, etc.

## Rate Limiting

Implementación en memoria con limpieza automática:
- General: 60 req/min por IP
- Login: 5 req/15min por IP
- Headers estándar: `X-RateLimit-Remaining`, `Retry-After`

## Modelo de Datos

Ver `docs/data-model.md` para detalle completo. Highlights:
- Precios con `Decimal(12,2)` para precisión
- Soft delete en productos (status DISCONTINUED)
- Full-text search con Postgres
- Auditoría automática
