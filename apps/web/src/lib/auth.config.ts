import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [], // Providers added in auth.ts (needs Node.js runtime)
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const publicPaths = ["/login", "/api/auth", "/api/crm/webhooks"];
      const isPublic = publicPaths.some((p) => pathname.startsWith(p));

      if (isPublic) return true;
      if (!isLoggedIn) return false;

      // Admin route protection
      const adminPaths = ["/admin", "/api/admin"];
      const adminRoles = ["SUPER_ADMIN", "ADMIN"];
      const isAdminPath = adminPaths.some((p) => pathname.startsWith(p));

      if (isAdminPath) {
        const role = (auth?.user as { role?: string })?.role;
        if (!role || !adminRoles.includes(role)) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
