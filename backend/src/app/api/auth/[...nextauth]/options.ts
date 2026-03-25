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

        // Check if they are an Admin in the Verifier table
        const isAdmin = await prisma.verifier.findUnique({
          where:  { email: user.email },
          select: { id: true },
        });

        // Admin exists → allow through, no DB write needed
        if (isAdmin) return true;

        // Not an admin → upsert into User table
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
      if (oauthUser?.email) {
        const verifier = await prisma.verifier.findUnique({
          where:  { email: oauthUser.email },
          select: { id: true, role: true },
        });

        if (verifier) {
          token.id   = verifier.id;
          token.role = verifier.role;   // "Admin" | "HOD" | "Dean" etc.
        } else {
          const dbUser = await prisma.user.findUnique({
            where:  { email: oauthUser.email },
            select: { id: true },
          });
          token.id   = dbUser?.id;
          token.role = "User";
        }
      }
      return token;
    },

    // ── session ───────────────────────────────────────────────────────
    async session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id   as string;
        session.user.role = token.role as string;
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