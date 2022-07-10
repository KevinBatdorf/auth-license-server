import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { WebhookData } from '../types'
import { getUserBy } from './user'

export const createWebhookForUser = (userId: number, data: WebhookData) =>
    prisma.webhook.create({
        data: Object.assign(data, { user: { connect: { id: userId } } }),
    })

export const revokeWebhook = async (webhookId: number) => {
    if (!webhookId) {
        throw new Error('WebhookId is missing')
    }
    const webhook = await prisma.webhook.update({
        where: { id: Number(webhookId) },
        data: { updatedAt: new Date(), token: null },
    })
    return getUserBy({ id: Number(webhook.userId) })
}

export const getWebhookBy = async (data: Prisma.WebhookWhereUniqueInput) => {
    const session = await prisma.webhook.findUniqueOrThrow({ where: data })
    if (!session?.token) {
        throw new Error('Webhook not found')
    }
    return session
}
