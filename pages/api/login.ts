import { prisma } from '../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { email, password } = req.body
    let user
    try {
        user = await prisma.user.findUnique({
            rejectOnNotFound: true,
            where: { email },
        })
    } catch (e) {
        console.log(e)
        res.status(401).send({ error: 'User not found' })
        return
    }

    // Check password matches
    if (!bcrypt.compareSync(password, user.password)) {
        res.status(401).send({ error: 'Incorrect password' })
        return
    }

    // Check how many unused licenses are available
    // total licenses - active sessions

    // If none available, return error

    // Create refresh token and place in cookie
    // Also create Session item and store refresh token in there
    // Be sure to store that session id in the token

    // Create the access token
    // and send it back
    res.status(200).json(user)

    // Generate JWT
    // const token = jwt.sign(
    //     {
    //         status: user.status,
    //         time: new Date().getTime(),
    //     },
    //     process.env.JWT_SECRET,
    //     { expiresIn: '8h' },
    // )
}
