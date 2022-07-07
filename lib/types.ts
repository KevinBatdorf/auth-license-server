import { License, Session, User, Webhook } from '@prisma/client'

export type AccessTokenData = {
    userId: number
    role: string
    status: string
    limited: boolean
}
export type RefreshTokenData = {
    sessionId: number
} & AccessTokenData

export type EmailTokenData = {
    userId: number
    email: string
}

export type WebhookTokenData = {
    userId: number
}

export type SessionData = {
    userAgent: string | undefined
    host: string | undefined
    country: string | undefined
    city: string | undefined
    region: string | undefined
    limited: boolean
}

export type WebhookData = {
    name: string
    token?: string
}

export type UserWithData = User & {
    licenses: License[]
    sessions: Session[]
    webhooks: Webhook[]
}

export type Payload = {
    action: string
    email?: string
    id?: number
    name?: string
    role?: 'ADMIN'
    status?: string
}
