export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  ANALYST: "ANALYST",
  DROPSHIPPER: "DROPSHIPPER",
  GUEST: "GUEST",
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

export type Permission =
  | "products:read"
  | "products:write"
  | "products:delete"
  | "research:read"
  | "research:write"
  | "research:delete"
  | "marketing:read"
  | "marketing:write"
  | "marketing:delete"
  | "users:read"
  | "users:write"
  | "users:delete"
  | "suppliers:read"
  | "suppliers:write"
  | "suppliers:delete"
  | "categories:read"
  | "categories:write"
  | "categories:delete"
  | "countries:read"
  | "countries:write"
  | "countries:delete"
  | "collections:read"
  | "collections:write"
  | "collections:delete"
  | "orders:read"
  | "orders:write"
  | "orders:delete"
  | "distributors:read"
  | "distributors:write"
  | "distributors:delete"
  | "platforms:read"
  | "platforms:write"
  | "price-tiers:read"
  | "price-tiers:write"
  | "audit:read"
  | "admin:access"
  | "crm:read"
  | "crm:write"
  | "crm:delete"
  | "crm:campaigns:read"
  | "crm:campaigns:write"
  | "crm:campaigns:send"
  | "crm:whatsapp:read"
  | "crm:whatsapp:write"
  | "crm:whatsapp:send"
  | "crm:automations:read"
  | "crm:automations:write";

export const ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
  SUPER_ADMIN: [
    "products:read",
    "products:write",
    "products:delete",
    "research:read",
    "research:write",
    "research:delete",
    "marketing:read",
    "marketing:write",
    "marketing:delete",
    "users:read",
    "users:write",
    "users:delete",
    "suppliers:read",
    "suppliers:write",
    "suppliers:delete",
    "categories:read",
    "categories:write",
    "categories:delete",
    "countries:read",
    "countries:write",
    "countries:delete",
    "collections:read",
    "collections:write",
    "collections:delete",
    "orders:read",
    "orders:write",
    "orders:delete",
    "distributors:read",
    "distributors:write",
    "distributors:delete",
    "platforms:read",
    "platforms:write",
    "price-tiers:read",
    "price-tiers:write",
    "audit:read",
    "admin:access",
    "crm:read",
    "crm:write",
    "crm:delete",
    "crm:campaigns:read",
    "crm:campaigns:write",
    "crm:campaigns:send",
    "crm:whatsapp:read",
    "crm:whatsapp:write",
    "crm:whatsapp:send",
    "crm:automations:read",
    "crm:automations:write",
  ],
  ADMIN: [
    "products:read",
    "products:write",
    "products:delete",
    "research:read",
    "research:write",
    "research:delete",
    "marketing:read",
    "marketing:write",
    "marketing:delete",
    "users:read",
    "users:write",
    "suppliers:read",
    "suppliers:write",
    "suppliers:delete",
    "categories:read",
    "categories:write",
    "categories:delete",
    "countries:read",
    "countries:write",
    "collections:read",
    "orders:read",
    "orders:write",
    "orders:delete",
    "distributors:read",
    "distributors:write",
    "distributors:delete",
    "platforms:read",
    "platforms:write",
    "price-tiers:read",
    "price-tiers:write",
    "audit:read",
    "admin:access",
    "crm:read",
    "crm:write",
    "crm:delete",
    "crm:campaigns:read",
    "crm:campaigns:write",
    "crm:campaigns:send",
    "crm:whatsapp:read",
    "crm:whatsapp:write",
    "crm:whatsapp:send",
    "crm:automations:read",
    "crm:automations:write",
  ],
  ANALYST: [
    "products:read",
    "research:read",
    "research:write",
    "research:delete",
    "marketing:read",
    "collections:read",
    "orders:read",
    "price-tiers:read",
    "crm:read",
    "crm:campaigns:read",
    "crm:whatsapp:read",
    "crm:automations:read",
  ],
  DROPSHIPPER: [
    "products:read",
    "research:read",
    "marketing:read",
    "collections:read",
    "collections:write",
    "collections:delete",
    "orders:read",
    "orders:write",
    "distributors:read",
    "platforms:read",
    "platforms:write",
    "price-tiers:read",
    "crm:read",
  ],
  GUEST: ["products:read"],
};

export function hasPermission(role: RoleType, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
