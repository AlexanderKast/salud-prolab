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
  | "audit:read"
  | "admin:access";

export const ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
  SUPER_ADMIN: [
    "products:read", "products:write", "products:delete",
    "research:read", "research:write", "research:delete",
    "marketing:read", "marketing:write", "marketing:delete",
    "users:read", "users:write", "users:delete",
    "suppliers:read", "suppliers:write", "suppliers:delete",
    "categories:read", "categories:write", "categories:delete",
    "countries:read", "countries:write", "countries:delete",
    "collections:read", "collections:write", "collections:delete",
    "audit:read", "admin:access",
  ],
  ADMIN: [
    "products:read", "products:write", "products:delete",
    "research:read", "research:write", "research:delete",
    "marketing:read", "marketing:write", "marketing:delete",
    "users:read", "users:write",
    "suppliers:read", "suppliers:write", "suppliers:delete",
    "categories:read", "categories:write", "categories:delete",
    "countries:read", "countries:write",
    "collections:read",
    "audit:read", "admin:access",
  ],
  ANALYST: [
    "products:read",
    "research:read", "research:write", "research:delete",
    "marketing:read",
    "collections:read",
  ],
  DROPSHIPPER: [
    "products:read",
    "research:read",
    "marketing:read",
    "collections:read", "collections:write", "collections:delete",
  ],
  GUEST: [
    "products:read",
  ],
};

export function hasPermission(role: RoleType, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
