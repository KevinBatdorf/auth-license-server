import { prisma } from '../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import Cors from 'cors'
import initMiddleware from '../../lib/init-middleware'

// Admin only endpoint
const cors = initMiddleware(
    Cors({
        methods: ['GET'],
        // origin: 'https://my-website.com'
    }),
)
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await cors(req, res)
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' })
        return
    }

    if (!req.headers?.['x-access-token'] || !process.env.JWT_TOKEN) {
        res.status(401).json({ error: 'Unauthorized' })
        return
    }

    // Check access token from header
    const { role, status } = jwt.verify(
        req.headers?.['x-access-token']?.toString(),
        process.env.JWT_TOKEN.toString(),
    ) as { role: string; status: string }

    if (role !== 'ADMIN' || status !== 'ACTIVE') {
        res.status(401).json({ error: 'Unauthorized' })
        return
    }

    // TODO: accept pagination, sort, options, etc
    const { userId } = req.query

    // Grab all users, or accept an id for users
    if (userId) {
        let user
        try {
            user = await prisma.user.findUniqueOrThrow({
                where: { id: Number(userId) },
                include: {
                    sessions: true,
                    licenses: true,
                    webhooks: true,
                },
            })
        } catch (error) {
            res.status(404).send({ error: 'User not found' })
            return
        }
        res.status(200).send(user)
        return
    }

    // Just return all for now - later add pagination. etc
    const users = await prisma.user.findMany({
        include: {
            sessions: true,
            licenses: true,
            webhooks: true,
        },
    })
    res.status(200).send(users)
    return
}
