import { prisma } from '../../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    // Start time
    const start = Date.now()

    // Check email exists
    let user
    try {
        user = await prisma.user.findUnique({
            where: { email: req.body.email },
        })
    } catch (error) {
        // Do nothing because we will wait on the timer
    }

    // generate email token
    if (user && process.env?.JWT_EMAIL) {
        const { id: userId, email } = user
        const token = jwt.sign({ userId, email }, process.env.JWT_EMAIL, {
            expiresIn: '30m',
        })
        // TODO: send email with token
    }

    // Make sure 3 seconds have passed
    const timeLeft = Date.now() - start
    if (timeLeft < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - timeLeft))
    }
    // Respond with success and generic message
    res.status(200).send({ success: true })
}
