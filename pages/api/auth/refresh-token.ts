import { NextApiRequest, NextApiResponse } from 'next'
import { method, cors } from '@/lib/access'
import {
    createTokenCookie,
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} from '@/lib/auth'
import {
    getSessionBy,
    revokeSessionToken,
    updateSessionToken,
} from '@/lib/models/session'
import { RefreshTokenData } from '@/lib/types'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await cors(req, res, { methods: ['POST'] })
    await method(req, res, { methods: ['POST'] })

    // Grab refresh token from cookie
    const { refreshToken } = req.cookies

    // If not found, return error
    if (!refreshToken) {
        res.status(401).send({ error: 'Refresh token not found' })
        return
    }

    // Verify refresh token and return error if not
    const data = await verifyRefreshToken(refreshToken).catch(() => {
        res.status(401).send({ error: 'Invalid refresh token' })
    })
    if (!data) return
    const { userId, sessionId, role, status, limited } =
        data as RefreshTokenData

    // Check session is active
    const session = await getSessionBy({ id: sessionId }).catch((err) => {
        res.status(401).send({ error: 'Session is inactive' })
    })
    if (!session) return

    // Check that the refresh token wasn't revoked or tampered with
    if (session?.token !== refreshToken) {
        // Remove the session - requiring them to login again
        await revokeSessionToken(sessionId)
        res.status(401).send({ error: 'Session was revoked' })
        return
    }

    // Create a new refresh token
    const refreshTokenNew = await signRefreshToken('180d', {
        userId,
        sessionId,
        role,
        status,
        limited,
    })

    // Add the new token back into the session item
    await updateSessionToken(session.id, refreshTokenNew)

    // Set the cookie 180 days
    res.setHeader(
        'Set-Cookie',
        await createTokenCookie(refreshTokenNew, 15_552_000),
    )

    // Create the access token
    const accessToken = await signAccessToken('10m', {
        userId,
        status,
        role,
        limited,
    })

    // Send the access token and refresh token back
    res.status(200).send({
        refreshToken: refreshTokenNew,
        accessToken,
    })
}
