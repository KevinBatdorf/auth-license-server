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
