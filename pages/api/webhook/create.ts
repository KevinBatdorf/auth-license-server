import { prisma } from '../../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    // cors
    // Grab access token and verify
    // Confirm they are admin role and active
    // Create Webhook item and assign to the user
}
