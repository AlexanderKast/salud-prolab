# Modelo de Datos - Salud ProLab

## Diagrama de Entidades

### Autenticación
- **User** - Usuarios del sistema con roles RBAC
- **Account** - Cuentas OAuth (para futura integración)
- **Session** - Sesiones activas
- **VerificationToken** - Tokens de verificación de email

### Geografía
- **Country** - Países soportados (CO, EC) con moneda y tasa de impuesto

### Catálogo
- **Category** - Categorías jerárquicas (auto-referencia parent/children)
- **Supplier** - Proveedores de productos
- **Product** - Producto principal con búsqueda full-text
- **ProductVariant** - Variantes (sabor, tamaño, etc.) con SKU único
- **ProductCountryAvailability** - Disponibilidad y precio local por país
- **PriceRule** - Reglas de precios (descuentos, volumen)
- **Asset** - Archivos multimedia (imágenes, videos, documentos)

### Investigación
- **ResearchNote** - Notas de investigación de mercado
- **CompetitorBenchmark** - Benchmarks de competidores con precio, rating, pros/cons

### Marketing
- **Playbook** - Playbooks de marketing con metodología ESFERA
- **PlaybookSection** - Secciones por fase (Estrategia, Segmentos, Funnel, Ejecución, Recursos, Análisis)
- **Template** - Plantillas de contenido (Email, Social, WhatsApp, Landing, Ads)

### Colecciones
- **Collection** - Colecciones de productos por usuario
- **CollectionItem** - Items en una colección (producto + notas)

### Auditoría
- **AuditLog** - Registro de acciones (quién hizo qué y cuándo)
- **Event** - Cola de eventos para procesamiento asíncrono

## Relaciones Clave

```
User ──< Collection ──< CollectionItem >── Product
User ──< AuditLog
Product >── Category
Product >── Supplier
Product ──< ProductVariant
Product ──< ProductCountryAvailability >── Country
Product ──< Asset
Product ──< ResearchNote ──< CompetitorBenchmark
Product ──< PriceRule >── Country
Playbook ──< PlaybookSection
Category ──< Category (parent/children)
```

## Tipos de Datos Especiales

- **Precios**: `Decimal(12,2)` para precisión monetaria
- **Tags**: `String[]` (arrays de PostgreSQL)
- **FAQs**: `Json` (estructura flexible)
- **Atributos de variante**: `Json` (key-value flexible)
- **Detalles de auditoría**: `Json` (snapshot del cambio)

## Enums

| Enum | Valores |
|------|---------|
| Role | SUPER_ADMIN, ADMIN, ANALYST, DROPSHIPPER, GUEST |
| Currency | COP, USD |
| ProductStatus | DRAFT, ACTIVE, PAUSED, DISCONTINUED |
| AssetType | IMAGE, VIDEO, DOCUMENT, CERTIFICATE |
| PlaybookStatus | DRAFT, PUBLISHED, ARCHIVED |
| TemplateType | EMAIL, SOCIAL, LANDING, AD, WHATSAPP |
