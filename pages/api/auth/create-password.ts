import { prisma } from '../../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { validatePasswordPolicy } from '../../../lib/auth'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (!process.env.JWT_EMAIL) {
        res.status(500).send({ error: 'JWT_EMAIL token not set' })
        return
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' })
        return
    }

    const { token, password, confirm } = req.body

    if (!password || password !== confirm) {
        res.status(400).send({ error: 'Passwords do not match' })
        return
    }

    // Validate password policy
    try {
        validatePasswordPolicy(password)
    } catch (e: any) {
        res.status(400).send({ error: e.message })
        return
    }

    // Verify email token
    let userId, email
    try {
        const tokenResponse = jwt.verify(token, process.env.JWT_EMAIL) as {
            userId: number
            email: string
        }
        userId = tokenResponse.userId
        email = tokenResponse.email
        if (!userId || !email) {
            throw new Error('Invalid token')
        }
    } catch (e) {
        res.status(401).send({ error: 'Invalid token' })
        return
    }

    let user
    try {
        user = await prisma.user.findUniqueOrThrow({
            where: { id: userId },
        })
        if (user.email !== email) {
            throw new Error('Email mismatch')
        }
    } catch (e) {
        // If the email doesn't match then the token should be considered invalid
        res.status(401).send({ error: 'Invalid token' })
        return
    }

    // Update password - script will throw if the user doesnt exist
    const salt = bcrypt.genSaltSync()
    await prisma.user.update({
        where: { id: userId },
        data: {
            updatedAt: new Date(),
            password: bcrypt.hashSync(password, salt),
        },
    })

    // Remove all sessions for this user
    await prisma.session.updateMany({
        where: { userId },
        data: { updatedAt: new Date(), token: null },
    })

    // TODO: Send email

    // return success
    res.status(200).send({ success: true })
}
