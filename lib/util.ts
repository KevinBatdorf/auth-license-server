import { UserWithData } from './types'

export const getUnusedLicenses = (user: UserWithData) => {
    const totalLicenses = user.licenses
        .filter((l) => {
            return new Date(l.validUntil) > new Date()
        })
        .reduce((total, next) => total + next.seats, 0)

    // Get active sessions - don't count limited sessions
    // Limited sessions could be an admin page, or if they
    // are in a trial mode (possibly?)
    const activeSessions = user.sessions.filter(
        (s) => s.token?.length && !s.limited,
    )
    // Check remaining licenses
    return totalLicenses - activeSessions?.length
}

export const kebabToCamel = (str: string) =>
    str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())

/** Exclude fields on Prisma */
export const excludeFields = <Model, Key extends keyof Model>(
    model: Model,
    ...keys: Key[]
): Omit<Model, Key> => {
    for (let key of keys) delete model[key]
    return model
}
