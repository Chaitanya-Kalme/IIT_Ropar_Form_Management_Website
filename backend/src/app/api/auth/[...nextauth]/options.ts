import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider !== 'google') return false;

            try {
                // Admin portal only — check verifier table
                const verifier = await prisma.verifier.findFirst({
                    where: { email: user.email! },
                });

                if (!verifier || verifier.role !== 'admin') {
                    console.error('[signIn] Not a registered admin:', user.email);
                    return false;
                }

                // Attach to user object so jwt() can persist it
                user.id          = verifier.id;
                user.userName    = verifier.userName;
                user.role        = verifier.role;
                (user as any).portal = 'admin';

                return true;

            } catch (error) {
                console.error('[signIn] Error:', error);
                return false;
            }
        },

        async jwt({ token, user, account }) {
            // Only runs on first sign in
            if (account && user) {
                token.id       = user.id;
                token.userName = user.userName;
                token.email    = user.email;
                token.role     = user.role;
                token.portal   = (user as any).portal ?? 'admin';
            }
            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.user.id       = token.id;
                session.user.userName = token.userName;
                session.user.email    = token.email;
                session.user.role     = token.role;
                session.user.portal   = token.portal;
            }
            return session;
        },
    },

    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: { strategy: 'jwt' },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };