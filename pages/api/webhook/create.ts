import { prisma } from '../../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import Cors from 'cors'
import initMiddleware from '../../../lib/init-middleware'

const cors = initMiddleware(Cors({ methods: ['POST'] }))
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await cors(req, res)

    if (!process.env.JWT_TOKEN || !process.env.JWT_WEBHOOK) {
        res.status(500).send({ error: 'JWT_WEBHOOK or JWT_TOKEN not set' })
        return
    }
    if (!req.headers?.['x-access-token']) {
        res.status(401).json({ error: 'Unauthorized' })
        return
    }

    const name = req.body?.name?.trim()
    if (!name) {
        res.status(400).json({ error: 'Name is required' })
        return
    }
    if (name.length < 3) {
        res.status(400).json({ error: 'Name must be at least 3 characters' })
        return
    }

    // Check access token from header
    const { role, status, userId } = jwt.verify(
        req.headers?.['x-access-token']?.toString(),
        process.env.JWT_TOKEN.toString(),
    ) as { role: string; status: string; userId: number }

    if (role !== 'ADMIN' || status !== 'ACTIVE') {
        res.status(401).json({ error: 'Unauthorized' })
        return
    }

    // Create Webhook item and assign to the user
    const webhook = await prisma.webhook.create({
        data: {
            name: name,
            token: jwt.sign({ userId }, process.env.JWT_WEBHOOK.toString(), {
                expiresIn: '9999y',
            }),
            user: { connect: { id: userId } },
        },
    })

    res.status(200).send({
        webhook: `${process.env.APP_URL}/api/webhook?token=${webhook.token}`,
    })
}
