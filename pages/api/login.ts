import { prisma } from '../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import { makeSessionName } from '../../lib/util'
import Cors from 'cors'
import initMiddleware from '../../lib/init-middleware'

const cors = initMiddleware(Cors({ methods: ['GET', 'OPTIONS'] }))

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await cors(req, res)

    if (!process.env.JWT_REFRESH || !process.env.JWT_TOKEN) {
        res.status(500).send('JWT_REFRESH or JWT_TOKEN not set')
        return
    }

    const { email, password } = req.body
    let user
    try {
        user = await prisma.user.findUnique({
            rejectOnNotFound: true,
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
    const unusedLicenses = totalLicenses - user.sessions.length
    // if none, return error
    if (unusedLicenses === 0) {
        res.status(401).send({ error: 'No licenses available' })
        return
    }

    // Create session db item and add to user
    const session = await prisma.session.create({
        data: {
            name: makeSessionName(req.headers),
            user: {
                connect: {
                    id: user.id,
                },
            },
        },
    })

    // Create refresh token and place in cookie
    const refreshToken = jwt.sign(
        {
            userId: user.id,
            sessionId: session.id,
        },
        process.env.JWT_REFRESH?.toString(),
        { expiresIn: '9999y' },
    )

    // Add the token back into the session item
    await prisma.session.update({
        where: { id: session.id },
        data: { token: refreshToken },
    })

    // Add the session to the user
    await prisma.user.update({
        where: { id: user.id },
        data: { sessions: { connect: { id: session.id } } },
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

    // Create the access token
    const accessToken = jwt.sign(
        {
            userId: user.id,
            status: user.status,
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
