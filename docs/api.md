# API Reference - Salud ProLab

Base URL: `http://localhost:3000/api`

Todas las rutas requieren autenticación excepto `/api/auth/*`.

## Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/callback/credentials` | Login con email/password |
| GET | `/api/auth/session` | Obtener sesión actual |
| POST | `/api/auth/signout` | Cerrar sesión |

## Productos

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/api/products` | `products:read` | Listar con filtros y paginación |
| POST | `/api/products` | `products:write` | Crear producto |
| GET | `/api/products/:id` | `products:read` | Detalle con relaciones |
| PATCH | `/api/products/:id` | `products:write` | Actualizar producto |
| DELETE | `/api/products/:id` | `products:delete` | Soft delete (DISCONTINUED) |
| GET | `/api/products/:id/variants` | `products:read` | Listar variantes |
| POST | `/api/products/:id/variants` | `products:write` | Crear variante |
| GET | `/api/products/:id/availability` | `products:read` | Disponibilidad por país |
| POST | `/api/products/:id/availability` | `products:write` | Upsert disponibilidad |
| GET | `/api/products/:id/assets` | `products:read` | Listar assets |
| POST | `/api/products/:id/assets` | `products:write` | Registrar asset |

### Filtros de Productos (GET /api/products)

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| search | string | Búsqueda full-text en nombre y descripción |
| categoryId | string | Filtrar por categoría |
| supplierId | string | Filtrar por proveedor |
| status | enum | DRAFT, ACTIVE, PAUSED, DISCONTINUED |
| country | string | Código de país (CO, EC) |
| minPrice | number | Precio mínimo |
| maxPrice | number | Precio máximo |
| page | number | Página (default: 1) |
| limit | number | Items por página (default: 20, max: 100) |
| sortBy | enum | name, price, createdAt, updatedAt |
| sortOrder | enum | asc, desc |

## Investigación

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/api/research` | `research:read` | Listar notas |
| POST | `/api/research` | `research:write` | Crear nota |
| GET | `/api/research/:id` | `research:read` | Detalle con benchmarks |
| PATCH | `/api/research/:id` | `research:write` | Actualizar nota |
| DELETE | `/api/research/:id` | `research:delete` | Eliminar nota |
| GET | `/api/research/:id/benchmarks` | `research:read` | Listar benchmarks |
| POST | `/api/research/:id/benchmarks` | `research:write` | Crear benchmark |

## Marketing

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/api/marketing/playbooks` | `marketing:read` | Listar playbooks |
| POST | `/api/marketing/playbooks` | `marketing:write` | Crear playbook |
| GET | `/api/marketing/playbooks/:id` | `marketing:read` | Detalle con secciones |
| PATCH | `/api/marketing/playbooks/:id` | `marketing:write` | Actualizar playbook |
| DELETE | `/api/marketing/playbooks/:id` | `marketing:delete` | Eliminar playbook |
| PATCH | `/api/marketing/playbooks/:id/sections/:sectionId` | `marketing:write` | Actualizar sección |
| GET | `/api/marketing/templates` | `marketing:read` | Listar plantillas |
| POST | `/api/marketing/templates` | `marketing:write` | Crear plantilla |
| GET | `/api/marketing/templates/:id` | `marketing:read` | Detalle plantilla |
| PATCH | `/api/marketing/templates/:id` | `marketing:write` | Actualizar plantilla |
| DELETE | `/api/marketing/templates/:id` | `marketing:delete` | Eliminar plantilla |

## Colecciones

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/api/collections` | auth | Mis colecciones |
| POST | `/api/collections` | auth | Crear colección |
| GET | `/api/collections/:id` | owner | Detalle con productos |
| PATCH | `/api/collections/:id` | owner | Actualizar colección |
| DELETE | `/api/collections/:id` | owner | Eliminar colección |
| POST | `/api/collections/:id/items` | owner | Agregar producto |
| DELETE | `/api/collections/:id/items` | owner | Quitar producto |

## Admin

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/api/admin/users` | `users:read` | Listar usuarios |
| POST | `/api/admin/users` | `users:write` | Crear usuario |
| GET | `/api/admin/users/:id` | `users:read` | Detalle usuario |
| PATCH | `/api/admin/users/:id` | `users:write` | Actualizar usuario |
| DELETE | `/api/admin/users/:id` | `users:delete` | Desactivar usuario |
| GET/POST | `/api/admin/suppliers[/:id]` | `suppliers:*` | CRUD proveedores |
| GET/POST | `/api/admin/categories[/:id]` | `categories:*` | CRUD categorías |
| GET/POST | `/api/admin/countries[/:id]` | `countries:*` | CRUD países |
| GET | `/api/admin/audit-logs` | `audit:read` | Log de auditoría |

## Upload

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| POST | `/api/upload` | auth | Generar URL pre-firmada S3 |

### Body (POST /api/upload)
```json
{
  "filename": "product-image.jpg",
  "contentType": "image/jpeg",
  "folder": "products"
}
```

## Respuestas

### Éxito con paginación
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Error
```json
{
  "error": "Mensaje de error"
}
```

## Rate Limiting

- General: 60 requests/minuto por IP
- Login: 5 requests/15 minutos por IP
- Headers: `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`
