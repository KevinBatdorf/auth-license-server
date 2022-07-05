import { NextApiRequest, NextApiResponse } from 'next'
import { homeUrl } from '@/lib/constants'
import { cors, method } from '@/lib/access'
import { signWebhookToken, verifyAccessToken } from '@/lib/auth'
import { AccessTokenData } from '@/lib/types'
import { createWebhookForUser } from '@/lib/models/webhook'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await cors(req, res, { methods: ['POST'] })
    await method(req, res, { methods: ['POST'] })

    const accesstoken = req.headers?.['x-access-token']

    if (!accesstoken) {
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
    const data = await verifyAccessToken(String(accesstoken)).catch(() => {
        res.status(401).send({ error: 'Invalid token token' })
    })
    if (!data) return
    const { userId, role, status } = data as AccessTokenData

    if (role !== 'ADMIN' || status !== 'ACTIVE') {
        res.status(401).json({ error: 'Unauthorized' })
        return
    }

    // Create Webhook item and assign to the user
    const webhook = await createWebhookForUser(userId, {
        name,
        token: await signWebhookToken('9999y', { userId }),
    })

    res.status(200).send({
        webhook: `${homeUrl}/api/webhook?token=${webhook.token}`,
    })
}
