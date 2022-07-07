import { NextApiRequest, NextApiResponse } from 'next'
import { cors, method } from '@/lib/access'
import { verifyWebhookToken } from '@/lib/auth'
import { getWebhookBy } from '@/lib/models/webhook'
import { Webhooks } from '@/lib/webhooks'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await cors(req, res, { methods: ['POST'] })
    await method(req, res, { methods: ['POST'] })

    if (!req.query?.token) {
        res.status(401).json({ error: 'Unauthorized' })
        return
    }

    // Grab access token from query string
    const token = req.query.token?.toString()
    // Verify webhook token and return error if not
    const data = await verifyWebhookToken(token).catch(() => {
        res.status(401).send({ error: 'Invalid webhook token' })
    })
    if (!data) return
    // const { userId } = data as WebhookTokenData

    const webhook = await getWebhookBy({ token: token }).catch(() => {
        res.status(401).send({ error: 'Invalid token' })
    })
    if (!webhook) return

    const hook = await Webhooks(req.body).catch((e) => {
        res.status(400).send({ error: e.message })
    })
    if (!hook) return

    // Log that the webhook is being invoked by user
    const start = performance.now()
    console.log(
        `${hook} webhook: ${webhook.id} invoked by user ${webhook.userId}`,
    )
    const response = await hook().catch((e: any) => {
        res.status(500).json({ error: e.message })
        console.log(
            `${hook} webhook: ${webhook.id} failed with error: ${
                e.message
            } after ${performance.now() - start}ms`,
        )
    })
    if (!response) return

    const finished = performance.now()
    console.log(
        `${hook} webhook: ${webhook.id} completed after ${finished - start}ms`,
    )

    res.status(200).send({ success: true, response, time: finished - start })
}
