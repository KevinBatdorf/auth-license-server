import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { validateDate } from '../util'
import { getUserBy, revokeAllUserSessions } from './user'

export const createLicenseForUser = async (
    userId: number,
    {
        validUntil,
        productId = 'Item 577',
        seats,
    }: {
        validUntil?: string
        productId?: string
        seats?: number
    },
) => {
    const validated = async () =>
        Prisma.validator<Prisma.LicenseCreateInput>()({
            validUntil: await validateDate(validUntil),
            productId,
            seats: Number(seats ?? 1),
            user: { connect: { id: Number(userId) } },
        })

    await prisma.license.create({ data: await validated() })
    return await getUserBy({ id: Number(userId) })
}

export const updateLicense = async (
    licenseId: number,
    data: {
        validUntil?: string
        productId?: string
        seats?: number
    },
) => {
    const { productId, seats, validUntil } = data
    if (!licenseId) {
        throw new Error('Missing license id')
    }
    const validated = async () =>
        Prisma.validator<Prisma.LicenseUpdateInput>()({
            validUntil: await validateDate(validUntil),
            productId,
            seats: Number(seats ?? 1),
        })

    const license = await prisma.license.update({
        where: { id: Number(licenseId) },
        data: await validated(),
    })
    return await getUserBy({ id: Number(license.userId) })
}

export const deleteLicense = async (licenseId: number) => {
    const license = await prisma.license.delete({
        where: { id: Number(licenseId) },
        include: { user: true },
    })
    // If a lisence is deleted, clear their sessions as this would be abnormal
    await revokeAllUserSessions({ userId: license.user.id })
    return await getUserBy({ id: Number(license.userId) })
}
