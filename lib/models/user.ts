import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { hashPassword, randomPassword, signEmailToken } from '../auth'
import { sendPasswordResetEmail } from '../email'

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

export const updateUserPassword = async (
    data: Prisma.UserWhereUniqueInput,
    password: string,
) =>
    await prisma.user.update({
        where: data,
        data: { password: await hashPassword(password) },
    })

export const revokeAllUserSessions = async (data: Prisma.SessionWhereInput) =>
    await prisma.session.updateMany({
        where: data,
        data: { updatedAt: new Date(), token: null },
    })

export const createUser = async ({
    name,
    email,
    role,
}: {
    name?: string
    email?: string
    role?: 'ADMIN'
}) => {
    if (!email || !name) {
        throw new Error('Data is missing')
    }
    const password = randomPassword()
    const user = await prisma.user.create({
        data: {
            email: email,
            name: name,
            password: await hashPassword(password),
            role: role === 'ADMIN' ? 'ADMIN' : undefined,
        },
    })
    const { id: userId } = user
    const token = await signEmailToken('30m', { userId, email })
    await sendPasswordResetEmail(user.email, token)
    return user
}
