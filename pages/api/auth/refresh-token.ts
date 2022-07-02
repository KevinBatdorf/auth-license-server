import { prisma } from '../../../lib/prisma'
import cookie from 'cookie'
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
    // Often you will see a GET request on refresh tokens, but this
    // is not an idempotent function so we are using POST.
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
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

    // Check that the refresh token wasn't revoked or tampered wit
    if (session.token !== refreshToken) {
        // Remove the session - requiring them to login again
        await prisma.session.delete({
            where: { id: sessionId },
        })
        res.status(401).send({ error: 'Session was revoked' })
        return
    }

    // Create a new refresh token
    const refreshTokenNew = jwt.sign(
        { userId, sessionId },
        process.env.JWT_REFRESH?.toString(),
        // Never expires... but it's revokable
        { expiresIn: '9999y' },
    )

    // Update token and last activity timestamp
    await prisma.session.update({
        where: { id: sessionId },
        data: {
            updatedAt: new Date(),
            token: refreshTokenNew,
        },
    })

    // Set the cookie
    res.setHeader(
        'Set-Cookie',
        cookie.serialize('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3_155_760_000, // 100 years
            path: '/',
        }),
    )

    // create a new access token and send it back
    const accessToken = jwt.sign(
        { userId, sessionId },
        process.env.JWT_TOKEN.toString(),
        { expiresIn: '10m' },
    )

    // Send the access token and refresh token back
    res.status(200).send({
        refreshToken: refreshTokenNew,
        accessToken,
    })
}
