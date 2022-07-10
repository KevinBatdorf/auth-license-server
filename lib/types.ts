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
    validUntil?: Date
    productId?: string
    seats?: number
    sessionId?: number
    licenseId?: number
    webhookId?: number
    name?: string
    role?: 'ADMIN'
    status?: string
}
