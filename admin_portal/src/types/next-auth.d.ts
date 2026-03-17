import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth'{
    interface User{
        id?: string,
        userName?: string,
        email?: string,
        role?: string
    }
    interface Session{
        user: {
            id?: string,
            userName?: string,
            email?: string,
            role?: string
        } & DefaultSession ['user']
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id?: string,
        userName?: string
        email?: string,
        role?: string
    }
}