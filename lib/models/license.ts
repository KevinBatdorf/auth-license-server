import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revokeAllUserSessions } from './user'

export const createLicenseForUser = async (
    userId: number,
    {
        validUntil,
        productId = 'Item 577',
        seats,
    }: {
        validUntil?: Date
        productId?: string
        seats?: number
    },
) => {
    if (!validUntil) throw new Error('Expired date is missing')
    await prisma.license.create({
        data: Object.assign(
            { validUntil, productId, seats },
            { user: { connect: { id: userId } } },
        ),
    })
    return true
}

export const updateLicense = (
    licenseId: number,
    data: Prisma.LicenseUpdateInput,
) => prisma.license.update({ where: { id: licenseId }, data })

export const deleteLicense = async (licenseId: number) => {
    const license = await prisma.license.delete({
        where: { id: licenseId },
        include: { user: true },
    })
    // If a lisence is deleted, clear their sessions as this would be abnormal
    await revokeAllUserSessions({ userId: license.user.id })
    return true
}
