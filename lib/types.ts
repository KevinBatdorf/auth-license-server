import { License, Prisma, Session, User, Webhook } from '@prisma/client';

export type AccessTokenData = {
    userId: number;
    role: string;
    status: string;
    limited: boolean;
};
export type RefreshTokenData = {
    sessionId: number;
} & AccessTokenData;

export type EmailTokenData = {
    userId: number;
    email: string;
};

export type WebhookTokenData = {
    userId: number;
};

export type WebhookData = {
    name: string;
    token?: string;
};

export type UserWithData = User & {
    licenses: License[];
    sessions: Session[];
    webhooks: Webhook[];
};

export type Payload = {
    action: string;
    userId?: number;
    email?: string;
    password?: string;
    validUntil?: string;
    productId?: string;
    seats?: number;
    sessionId?: number;
    licenseId?: number;
    webhookId?: number;
    name?: string;
    role?: 'ADMIN' | 'OWNER' | 'MANAGER';
    status?: 'ACTIVE' | 'INACTIVE';
};
