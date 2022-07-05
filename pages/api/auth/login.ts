import { NextApiRequest, NextApiResponse } from 'next'
import { cors, method } from '@/lib/access'
import { getUserBy } from '@/lib/models/user'
import {
    comparePasswords,
    createTokenCookie,
    signRefreshToken,
    signAccessToken,
} from '@/lib/auth'
import { createSessionForUser, updateSessionToken } from '@/lib/models/session'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await cors(req, res, { methods: ['POST'] })
    await method(req, res, { methods: ['POST'] })

    const { email, password } = req.body
    const { country, city, region } = req.query

    const user = await getUserBy({ email }).catch(() => {
        res.status(401).send({ error: 'Invalid credentials' })
    })
    if (!user) return

    // Check password is set
    if (!user?.password) {
        res.status(401).send({ error: 'Password not set' })
        return
    }

    // Check password
    if (!password || !(await comparePasswords(password, user.password))) {
        res.status(401).send({ error: 'Invalid credentials' })
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
    // If none, return error
    if (unusedLicenses === 0) {
        res.status(401).send({ error: 'No licenses available' })
        return
    }

    // Create session db item and add to user
    const session = await createSessionForUser(user.id, {
        userAgent: req.headers['user-agent'],
        host: req.headers['host'],
        country: country ? country.toString() : undefined,
        city: city ? city.toString() : undefined,
        region: region ? region.toString() : undefined,
    })

    // Create refresh token to place in cookie
    const refreshToken = await signRefreshToken('180d', {
        userId: user.id,
        status: user.status,
        role: user.role,
        sessionId: session.id,
    })

    // Add the token back into the session item
    await updateSessionToken(session.id, refreshToken)

    // Set the cookie 180 days
    res.setHeader(
        'Set-Cookie',
        await createTokenCookie(refreshToken, 15_552_000),
    )

    // Create the access token
    const accessToken = await signAccessToken('10m', {
        userId: user.id,
        status: user.status,
        role: user.role,
    })

    // Send the access token and refresh token back
    res.status(200).send({
        remainingLicenses: unusedLicenses - 1,
        accessToken,
        refreshToken,
    })
}
