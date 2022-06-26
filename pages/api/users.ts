import { prisma } from '../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    // cors
    // Grab all users, or accept a search for users
    // Accept pagination params
}
