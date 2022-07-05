import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { hashPassword } from '@/lib/auth'

export const getUserBy = async (data: Prisma.UserWhereUniqueInput) =>
    await prisma.user.findUniqueOrThrow({
        where: data,
        include: {
            sessions: true,
            licenses: true,
            webhooks: true,
        },
    })
export const getUsersBy = async (data: Prisma.UserWhereUniqueInput) =>
    await prisma.user.findMany({
        where: data,
        include: {
            sessions: true,
            licenses: true,
            webhooks: true,
        },
    })

export const updateUserPassword = async (userId: number, password: string) =>
    await prisma.user.update({
        where: { id: userId },
        data: { password: await hashPassword(password) },
    })

export const revokeAllUserSessions = async (userId: number) =>
    await prisma.session.updateMany({
        where: { userId },
        data: { updatedAt: new Date(), token: null },
    })
