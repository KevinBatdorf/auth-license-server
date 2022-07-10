import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const run = async () => {
    const salt = bcrypt.genSaltSync()
    await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            password: bcrypt.hashSync('password', salt),
            name: 'Kevin B',
            role: 'ADMIN',
            licenses: {
                create: [
                    {
                        validUntil: new Date(Date.now() + 31_536_000_000), // 1 year
                        productId: '123456789',
                    },
                    {
                        validUntil: new Date(Date.now() + 31_536_000_000), // 1 year
                        productId: '123456789',
                        seats: 5,
                    },
                ],
            },
        },
    })
}

run()
    .catch((e) => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
