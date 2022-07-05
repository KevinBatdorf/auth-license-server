import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { serialize } from 'cookie'
import {
    accessSecret,
    emailSecret,
    production,
    refreshSecret,
    webhookSecret,
} from './constants'
import {
    AccessTokenData,
    EmailTokenData,
    RefreshTokenData,
    WebhookTokenData,
} from './types'

export const comparePasswords = async (incoming: string, stored: string) =>
    new Promise((resolve, reject) => {
        bcrypt.compare(incoming, stored, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    })

export const hashPassword = async (password: string): Promise<string> =>
    new Promise((resolve) => {
        const salt = bcrypt.genSaltSync()
        const pass = bcrypt.hashSync(password, salt)
        resolve(pass)
    })

export const signRefreshToken = (
    expiresIn: string,
    data: RefreshTokenData,
): Promise<string> =>
    new Promise((resolve) => {
        const token = jwt.sign(data, refreshSecret, { expiresIn })
        resolve(token)
    })
export const signAccessToken = (
    expiresIn: string,
    data: AccessTokenData,
): Promise<string> =>
    new Promise((resolve) => {
        resolve(jwt.sign(data, accessSecret, { expiresIn }))
    })
export const signEmailToken = (
    expiresIn: string,
    data: EmailTokenData,
): Promise<string> =>
    new Promise((resolve) => {
        resolve(jwt.sign(data, emailSecret, { expiresIn }))
    })
export const signWebhookToken = (
    expiresIn: string,
    data: WebhookTokenData,
): Promise<string> =>
    new Promise((resolve) => {
        resolve(jwt.sign(data, webhookSecret, { expiresIn }))
    })

export const verifyRefreshToken = (token: string) =>
    new Promise((resolve, reject) => {
        jwt.verify(token, refreshSecret, (err, data) => {
            if (err) reject(err)
            resolve(data)
        })
    })
export const verifyAccessToken = (token: string) =>
    new Promise((resolve, reject) => {
        jwt.verify(token, accessSecret, (err, data) => {
            if (err) reject(err)
            resolve(data)
        })
    })
export const verifyEmailToken = async (token: string) =>
    new Promise((resolve, reject) => {
        jwt.verify(token, emailSecret, (err, data) => {
            if (err) reject(err)
            resolve(data)
        })
    })
export const verifyWebhookToken = async (token: string) =>
    new Promise((resolve, reject) => {
        jwt.verify(token, webhookSecret, (err, data) => {
            if (err) reject(err)
            resolve(data)
        })
    })

export const createTokenCookie = (
    token: string,
    maxAge: number,
): Promise<string> =>
    new Promise((resolve) => {
        const data = serialize('refreshToken', token, {
            httpOnly: true,
            secure: production,
            sameSite: 'strict',
            maxAge,
            path: '/',
        })
        resolve(data)
    })

export const validatePasswordPolicy = (password: string) =>
    new Promise((resolve, reject) => {
        if (password.length < 8) {
            reject('Password must be at least 8 characters')
        }
        if (!/[a-z]/.test(password)) {
            reject('Password must contain at least one lowercase letter')
        }
        if (!/[A-Z]/.test(password)) {
            reject('Password must contain at least one uppercase letter')
        }
        if (!/[0-9]/.test(password)) {
            reject('Password must contain at least one number')
        }
        resolve(true)
    })
