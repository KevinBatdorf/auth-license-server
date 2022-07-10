import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { hashPassword, randomPassword, signEmailToken } from '../auth'
import {
    sendDataChangedEmail,
    sendDeleteEmail,
    sendPasswordResetEmail,
    sendPasswordUpdatedEmail,
} from '../email'
import { excludeFields } from '../util'

export const getUserBy = async (data: Prisma.UserWhereUniqueInput) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: data,
        include: {
            sessions: true,
            licenses: true,
            webhooks: true,
        },
    })
    return excludeFields(user, 'password')
}

export const getUserWithPasswordBy = (data: Prisma.UserWhereUniqueInput) =>
    prisma.user.findUniqueOrThrow({
        where: data,
        include: {
            sessions: true,
            licenses: true,
            webhooks: true,
        },
    })

export const getUsersBy = async (data: Prisma.UserWhereUniqueInput) => {
    const users = await prisma.user.findMany({
        where: data,
        include: {
            sessions: true,
            licenses: true,
            webhooks: true,
        },
    })
    return users.map((user) => excludeFields(user, 'password'))
}

export const updateUserPassword = async (
    data: Prisma.UserWhereUniqueInput,
    password: string,
) => {
    const user = await prisma.user.update({
        where: data,
        data: { password: await hashPassword(password) },
    })

    // Send confirmation the password was updated
    await sendPasswordUpdatedEmail(user.email)

    return user
}

export const revokeAllUserSessions = async (data: Prisma.SessionWhereInput) => {
    await prisma.session.updateMany({
        where: data,
        data: { updatedAt: new Date(), token: null },
    })
    return true
}

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
    return excludeFields(user, 'password')
}

export const updateUser = async (
    userId: number,
    data: Prisma.UserUpdateInput,
) => {
    if (!userId) {
        throw new Error('Missing user id')
    }
    // If password was provided, update it separately
    if (data.password) {
        await updateUserPassword({ id: userId }, data.password.toString())
        delete data.password
    }
    const user = await prisma.user.update({
        where: { id: userId },
        data,
    })
    const userNoPassword = excludeFields(user, 'password')
    await sendDataChangedEmail(user.email, userNoPassword)
    return userNoPassword
}

export const deleteUser = async (userId: number) => {
    if (!userId) throw new Error('Missing user id')
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')
    try {
        await prisma.$transaction([
            prisma.license.deleteMany({ where: { userId } }),
            prisma.session.deleteMany({ where: { userId } }),
            prisma.user.delete({ where: { id: userId } }),
        ])
    } catch (e) {
        throw new Error('Failed to delete user')
    }
    await sendDeleteEmail(user.email)
    return true
}
