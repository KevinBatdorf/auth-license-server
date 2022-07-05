export type AccessTokenData = {
    userId: number
    role: string
    status: string
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
}

export type WebhookData = {
    name: string
    token?: string
}
