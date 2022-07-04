import { prisma } from '../../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import Cors from 'cors'
import initMiddleware from '../../../lib/init-middleware'

const cors = initMiddleware(Cors({ methods: ['POST'] }))

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await cors(req, res)

    if (!process.env.JWT_REFRESH || !process.env.JWT_TOKEN) {
        res.status(500).send({ error: 'JWT_REFRESH or JWT_TOKEN not set' })
        return
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' })
        return
    }

    const { email, password } = req.body
    const { country, city, region } = req.query

    let user
    try {
        user = await prisma.user.findUniqueOrThrow({
            where: { email },
            include: {
                sessions: true,
                licenses: true,
            },
        })
    } catch (e) {
        res.status(401).send({ error: 'User not found' })
        return
    }

    // Check password is set
    if (!user.password) {
        res.status(401).send({ error: 'Password not set' })
        return
    }

    // Check password matches
    if (!bcrypt.compareSync(password, user.password)) {
        res.status(401).send({ error: 'Incorrect password' })
        return
    }

    // Check how many unused licenses are available
    const totalLicenses = user.licenses
        .filter((l) => {
            return new Date(l.validUntil) > new Date()
        })
        .reduce((total, next) => total + next.seats, 0)

    // Get active sessions
    const activeSessions = user.sessions.filter((s) => s.token?.length)
    // Check remaining licenses
    const unusedLicenses = totalLicenses - activeSessions?.length
    // if none, return error
    if (unusedLicenses === 0) {
        res.status(401).send({ error: 'No licenses available' })
        return
    }

    // Create session db item and add to user
    const session = await prisma.session.create({
        data: {
            userAgent: req.headers['user-agent'],
            host: req.headers['host'],
            country: country ? country.toString() : undefined,
            city: city ? country.toString() : undefined,
            region: region ? country.toString() : undefined,
            user: { connect: { id: user.id } },
        },
    })

    // Create refresh token to place in cookie
    const refreshToken = jwt.sign(
        {
            userId: user.id,
            sessionId: session.id,
        },
        process.env.JWT_REFRESH?.toString(),
        { expiresIn: '180d' },
    )

    // Add the token back into the session item
    await prisma.session.update({
        where: { id: session.id },
        data: { token: refreshToken },
    })

    // Set the cookie
    res.setHeader(
        'Set-Cookie',
        cookie.serialize('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15_552_000, // 180 days
            path: '/',
        }),
    )

    // Create the access token
    const accessToken = jwt.sign(
        {
            userId: user.id,
            status: user.status,
            role: user.role,
        },
        process.env.JWT_TOKEN?.toString(),
        { expiresIn: '10m' },
    )

    // Send the access token and refresh token back
    res.status(200).send({
        remainingLicenses: unusedLicenses - 1,
        accessToken,
        refreshToken,
    })
}
