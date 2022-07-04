export class AuthError extends Error {}

export const validatePasswordPolicy = (password: string) => {
    if (password.length < 8) {
        throw new AuthError('Password must be at least 8 characters')
    }
    if (!/[a-z]/.test(password)) {
        throw new AuthError(
            'Password must contain at least one lowercase letter',
        )
    }
    if (!/[A-Z]/.test(password)) {
        throw new AuthError(
            'Password must contain at least one uppercase letter',
        )
    }
    if (!/[0-9]/.test(password)) {
        throw new AuthError('Password must contain at least one number')
    }
}
