import { prisma } from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {

    // ── signIn ────────────────────────────────────────────────────────
    async signIn({ user }) {
      try {
        if (!user.email) return false;

        // Check if they are a Verifier/Admin
        const isVerifier = await prisma.verifier.findUnique({
          where:  { email: user.email },
          select: { id: true },
        });

        // Verifier exists → allow through, no User table write needed
        if (isVerifier) return true;

        // Regular user → upsert into User table
        await prisma.user.upsert({
          where:  { email: user.email },
          update: { userName: user.name ?? "Unknown" },
          create: {
            userName: user.name  ?? "Unknown",
            email:    user.email,
          },
        });

        return true;

      } catch (error) {
        console.error("[NextAuth signIn]", error);
        return false;
      }
    },

    // ── jwt ───────────────────────────────────────────────────────────
    async jwt({ token, user: oauthUser }) {
      // ✅ FIX: Resolve the DB identity on EVERY jwt call where token.id
      // is missing — not just on first sign-in when oauthUser is present.
      // This handles the race condition where token.id was never set.
      const email = oauthUser?.email ?? token.email;

      if (email && !token.id) {
        // Check verifier table first
        const verifier = await prisma.verifier.findUnique({
          where:  { email },
          select: { id: true, role: true },
        });

        if (verifier) {
          token.id     = verifier.id;
          token.role   = verifier.role;
          token.portal = verifier.role === "Admin" ? "admin" : "verifier";
        } else {
          // Regular user
          const dbUser = await prisma.user.findUnique({
            where:  { email },
            select: { id: true },
          });

          if (!dbUser) {
            // Edge case: user row not yet committed — create it now
            const created = await prisma.user.create({
              data: {
                userName: (oauthUser?.name ?? token.name ?? "Unknown") as string,
                email,
              },
              select: { id: true },
            });
            token.id = created.id;
          } else {
            token.id = dbUser.id;
          }

          token.role   = "User";
          token.portal = "user";
        }
      }

      return token;
    },

    // ── session ───────────────────────────────────────────────────────
    async session({ session, token }) {
      if (session.user) {
        session.user.id     = token.id     as string;
        session.user.role   = token.role   as string;
        session.user.portal = token.portal as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  session: {
    strategy: "jwt",
  },
};