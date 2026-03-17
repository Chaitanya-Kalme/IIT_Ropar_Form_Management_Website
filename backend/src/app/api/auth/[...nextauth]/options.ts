import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";



export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
    ],
    callbacks:{
        // async signIn({user, account, profile,email, credentials}){

        // },
        async jwt({token, user}){
            if(user){
                token.id = user.id
                token.userName = user.userName
                token.email = user.email
                token.role = user.role
            }
            return token
        },
        async session({session, token}){
            if(token){
                session.user.id = token.id
                session.user.userName = token.userName
                session.user.email = token.email
                session.user.role = token.role
            }
            return session
        }
    },
    pages:{
        signIn:'/login'
    },
    session: {
        strategy:"jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
}