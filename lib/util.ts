import { UserWithData } from './types'

export const getUnusedLicenses = (user: UserWithData) => {
    const totalLicenses = user.licenses
        .filter((l) => {
            return new Date(l.validUntil) > new Date()
        })
        .reduce((total, next) => total + next.seats, 0)

    // Get active sessions
    const activeSessions = user.sessions.filter((s) => s.token?.length)
    // Check remaining licenses
    return totalLicenses - activeSessions?.length
}

export const kebabToCamel = (str: string) =>
    str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
