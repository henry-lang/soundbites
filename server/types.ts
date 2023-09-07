import {User} from '@prisma/client'

export type CustomSessionData = {
    userId: User['id']
}

declare module 'express-session' {
    interface SessionData extends CustomSessionData {}
}