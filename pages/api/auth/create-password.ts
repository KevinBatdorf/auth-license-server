import { NextApiRequest, NextApiResponse } from 'next'
import { validatePasswordPolicy, verifyEmailToken } from '@/lib/auth'
import { method } from '@/lib/access'
import { EmailTokenData } from '@/lib/types'
import {
    getUserBy,
    revokeAllUserSessions,
    updateUserPassword,
} from '@/lib/models/user'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await method(req, res, { methods: ['POST'] })

    const { token, password, confirm } = req.body

    if (!password || password !== confirm) {
        res.status(400).send({ error: 'Passwords do not match' })
        return
    }

    // Validate password policy
    const pass = await validatePasswordPolicy(password).catch((e) => {
        res.status(400).send({ error: e.message })
        return false
    })
    if (!pass) return

    // Verify email token
    const data = await verifyEmailToken(token).catch(() => {
        res.status(401).send({ error: 'Invalid email token' })
    })
    if (!data) return
    const { userId, email } = data as EmailTokenData

    const user = await getUserBy({ id: userId }).catch(() => {
        res.status(401).send({ error: 'User not found' })
        return
    })
    if (!user) return

    if (user?.email !== email) {
        res.status(401).send({ error: 'Email mismatch' })
        return
    }

    // Update password - script will throw if the user doesnt exist
    await updateUserPassword(userId, password)

    // Remove all sessions for this user
    await revokeAllUserSessions(userId)

    // TODO: Send email

    // return success
    res.status(200).send({ success: true })
}
