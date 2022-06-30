import { prisma } from '../../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    // Move to middleware?
    // cors
    // POSt request
    // Grab access token from query string
    // If not found, return error
    // If invalid return error
    //
    // Check access token is set as ACTIVE webhook for active admin user
    // If not, it means it was revoked and we should deny access
    //
    //
    // try/catch over the incoming action function in a way where if
    // it doesn't exist it will return a 404
    // create-user
    // Send the user an email with a 30m token
    //
    // update-user
    // allow a password to be updated and status to be updated
    // delete-user
    // a way to completely delete a user (alternative to setting status to INACTIVE)
    //
    //
    // backup-database
}
