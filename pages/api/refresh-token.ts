import { prisma } from '../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    // Grab refresh token from cookie
    // If not found, return error
    //
    // Verify refresh token and return error if not
    //
    // Check refresh token is set on one of their sessions
    // If not, it means it was revoked and we should deny access
    //
    // create a new access token and send it back
}
