import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { sendSessionRevokedEmail } from '../email'

export const createSessionForUser = (
    userId: number,
    data: Omit<Prisma.SessionCreateInput, 'user'>,
) =>
    prisma.session.create({
        data: Object.assign(data, { user: { connect: { id: userId } } }),
    })

export const updateSessionToken = (sessionId: number, token: string) =>
    prisma.session.update({ where: { id: sessionId }, data: { token } })

export const deleteSession = async (sessionId: number) => {
    await prisma.session.delete({ where: { id: sessionId } })
    return true
}

export const revokeSessionToken = async (sessionId: number) => {
    const session = await prisma.session.update({
        where: { id: sessionId },
        data: { updatedAt: new Date(), token: null },
        include: { user: true },
    })
    await sendSessionRevokedEmail(session.user.email)
    return true
}

export const getSessionBy = async (data: Prisma.SessionWhereUniqueInput) => {
    const session = await prisma.session.findUniqueOrThrow({ where: data })
    if (!session?.token) {
        throw new Error('Session not found')
    }
    return session
}
