import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: '127.0.0.1',
    port: 2525,
    auth: {
        user: 'Mailbox-Name',
        pass: 'pass',
    },
})

export const sendPasswordResetEmail = async (email: string, token: string) => {
    return await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: email,
        subject: 'Password reset requested',
        text: token,
        html: `<a href="http://localhost:3000/create-password?token=${token}">Reset password</a>`,
    })
}
