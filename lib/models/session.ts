import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { SessionData } from '../types'

export const createSessionForUser = (userId: number, data: SessionData) =>
    prisma.session.create({
        data: Object.assign(data, { user: { connect: { id: userId } } }),
    })

export const updateSessionToken = (sessionId: number, token: string) =>
    prisma.session.update({ where: { id: sessionId }, data: { token } })

export const revokeSessionToken = (sessionId: number) =>
    prisma.session.update({
        where: { id: sessionId },
        data: { updatedAt: new Date(), token: null },
    })

export const getSessionBy = async (data: Prisma.SessionWhereUniqueInput) => {
    const session = await prisma.session.findUniqueOrThrow({ where: data })
    if (!session?.token) {
        throw new Error('Session not found')
    }
    return session
}
