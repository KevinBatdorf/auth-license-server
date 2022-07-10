/**
 * Since emails are pretty domain specific this is
 * left pretty bare bones.
 */

import { User } from '@prisma/client'
import nodemailer from 'nodemailer'
import { homeUrl } from './constants'

const transporter = nodemailer.createTransport({
    host: '127.0.0.1',
    port: 2525,
    auth: {
        user: 'Auth server',
        pass: 'pass',
    },
})

export const sendCreatePasswordEmail = async (email: string, token: string) => {
    return await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: email,
        subject: 'Please set password',
        html: `<a href="${homeUrl}/create-password?token=${token}">Set password</a>`,
    })
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
    return await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: email,
        subject: 'Password reset requested',
        html: `<a href="${homeUrl}/create-password?token=${token}">Reset password</a>`,
    })
}

export const sendPasswordUpdatedEmail = async (email: string) => {
    return await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: email,
        subject: 'Password updated',
        text: 'Your password was updated.',
    })
}

export const sendSessionRevokedEmail = async (email: string) => {
    return await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: email,
        subject: 'Session revoked',
        text: 'Your access token was used unexpectedly.',
    })
}

export const sendDataChangedEmail = async (
    email: string,
    user: Omit<User, 'password'>,
) => {
    return await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: email,
        subject: 'Profile updated',
        text: JSON.stringify(user),
    })
}

export const sendDeleteEmail = async (email: string) => {
    return await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: email,
        subject: 'Account deleted',
        text: 'The account was deleted',
    })
}
