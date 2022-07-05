import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { WebhookData } from '../types'

export const createWebhookForUser = (userId: number, data: WebhookData) =>
    prisma.webhook.create({
        data: Object.assign(data, { user: { connect: { id: userId } } }),
    })

export const getWebhookBy = async (data: Prisma.WebhookWhereUniqueInput) => {
    const session = await prisma.webhook.findUniqueOrThrow({ where: data })
    if (!session?.token) {
        throw new Error('Webhook not found')
    }
    return session
}
