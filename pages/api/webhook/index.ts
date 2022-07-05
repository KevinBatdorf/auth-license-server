import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { webhookSecret } from '@/lib/constants'
import { cors, method } from '@/lib/access'
import { verifyWebhookToken } from '@/lib/auth'
import { WebhookTokenData } from '@/lib/types'
import { getWebhookBy } from '@/lib/models/webhook'

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
    const { action, payload } = req.body
    if (!action || !payload) {
        res.status(401).json({ error: 'Action or payload missing' })
        return
    }

    // Grab access token from query string
    const token = req.query.token?.toString()
    // Verify webhook token and return error if not
    const data = await verifyWebhookToken(token).catch(() => {
        res.status(401).send({ error: 'Invalid webhook token' })
    })
    if (!data) return
    const { userId } = data as WebhookTokenData

    const webhook = await getWebhookBy({ token: token }).catch(() => {
        res.status(401).send({ error: 'Invalid token' })
    })
    if (!webhook) return

    // convert kebab-case to camelCase
    const actionCamelCase = action.replace(/-([a-z])/g, (_: never, g: string) =>
        g.toUpperCase(),
    )

    const hooks = Webhooks(payload)
    // If the action isn't callable, error
    if (!Object.getOwnPropertyNames(hooks).includes(actionCamelCase)) {
        res.status(401).json({ error: 'Invalid action' })
        return
    }

    let response
    try {
        // TODO: Log action being called
        response = hooks[actionCamelCase as keyof typeof hooks]()
    } catch (e: any) {
        // TODO: Needs a better reporting mechanism
        console.log(e)
        res.status(500).json({ error: e.message })
        return
    }

    res.status(200).send({ success: true, response })

    // try/catch over the incoming action function in a way where if
    // it doesn't exist it will return a 404
    // create-user
    // Send the user an email with a 30m token
    //
    // update-user
    // allow a password to be updated and status to be updated
    // delete-user
    // a way to completely delete a user (alternative to setting status to INACTIVE)
    //
    //
    // backup-database
    // TODO logging
}
type Payload = {
    email?: string
    id?: number
    name?: string
    password?: string
    role?: string
    status?: string
}
const Webhooks = (payload: Payload) => {
    console.log(payload)
    return {
        createUser: function () {},
        updateUser: function () {},
        deleteUser: function () {},
        createLicense: function () {},
        updateLicense: function () {},
        deleteLicense: function () {},
        deleteSession: function () {},
        deleteWebhook: function () {},
    }
}
