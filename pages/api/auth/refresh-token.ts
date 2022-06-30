import { prisma } from '../../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import Cors from 'cors'
import initMiddleware from '../../../lib/init-middleware'

const cors = initMiddleware(Cors({ methods: ['POST', 'OPTIONS'] }))

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await cors(req, res)

    if (!process.env.JWT_REFRESH || !process.env.JWT_TOKEN) {
        res.status(500).send({ error: 'JWT_REFRESH or JWT_TOKEN not set' })
        return
    }

    // Grab refresh token from cookie
    const { refreshToken } = req.cookies

    // If not found, return error
    if (!refreshToken) {
        res.status(401).send({ error: 'Refresh token not found' })
        return
    }

    // Verify refresh token and return error if not
    const { userId, sessionId } = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH.toString(),
    ) as { userId: number; sessionId: number }
    if (!userId || !sessionId) {
        res.status(401).send({ error: 'Invalid refresh token' })
        return
    }

    // Check refresh token is set on one of their sessions
    let session
    try {
        session = await prisma.session.findUniqueOrThrow({
            where: { id: sessionId },
        })
    } catch (e) {
        // If not, it means it was revoked and we should deny access
        res.status(401).send({ error: 'Session not found' })
        return
    }

    // Update last login by updating the updatedAt timestamp
    await prisma.session.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
    })

    // Check that the refresh token wasn't revoked
    if (session.token !== refreshToken) {
        res.status(401).send({ error: 'Session was revoked' })
        return
    }

    // create a new access token and send it back
    const accessToken = jwt.sign(
        { userId, sessionId },
        process.env.JWT_TOKEN.toString(),
        { expiresIn: '10m' },
    )

    // Send the access token and refresh token back
    res.status(200).send({ accessToken })
}
