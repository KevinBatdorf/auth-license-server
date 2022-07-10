import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import {
    hashPassword,
    randomPassword,
    signEmailToken,
    validateEmailAddress,
} from '../auth'
import {
    sendCreatePasswordEmail,
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
            sessions: { where: { NOT: [{ token: null }] } },
            licenses: true,
            webhooks: { where: { NOT: [{ token: null }] } },
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
    if (!data.userId) {
        throw new Error('UserId is missing')
    }
    await prisma.session.updateMany({
        where: { userId: Number(data.userId) },
        data: { updatedAt: new Date(), token: null },
    })
    return getUserBy({ id: Number(data.userId) })
}

export const createUser = async ({
    name,
    email,
    role,
}: {
    name?: string
    email?: string
    role?: string
}) => {
    if (!email || !name) {
        throw new Error('Data is missing')
    }
    const password = randomPassword()
    const validated = async () =>
        Prisma.validator<Prisma.UserCreateInput>()({
            email: await validateEmailAddress(email),
            name,
            password: await hashPassword(password),
            role: role === 'ADMIN' ? 'ADMIN' : undefined,
        })
    const user = await prisma.user.create({
        data: await validated(),
    })
    const { id: userId } = user
    const token = await signEmailToken('30m', { userId, email })
    await sendCreatePasswordEmail(user.email, token)
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
    const email = data?.email
        ? await validateEmailAddress(data.email.toString())
        : undefined
    const userUpdateData = () =>
        Prisma.validator<Prisma.UserUpdateInput>()({
            email,
            name: data.name,
            role: data.role,
            status: data.status,
        })

    const user = await prisma.user.update({
        where: { id: Number(userId) },
        data: userUpdateData(),
    })
    const userNoPassword = excludeFields(user, 'password')
    await sendDataChangedEmail(user.email, userNoPassword)
    return userNoPassword
}

export const deleteUser = async (userId: number) => {
    if (!userId) throw new Error('Missing user id')
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } })
    if (!user) throw new Error('User not found')
    try {
        await prisma.$transaction([
            prisma.license.deleteMany({ where: { userId: Number(userId) } }),
            prisma.session.deleteMany({ where: { userId: Number(userId) } }),
            prisma.user.delete({ where: { id: Number(userId) } }),
        ])
    } catch (e) {
        throw new Error('Failed to delete user')
    }
    await sendDeleteEmail(user.email)
    return true
}
