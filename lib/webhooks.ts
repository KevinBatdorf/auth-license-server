import { User } from '@prisma/client'
import {
    createLicenseForUser,
    deleteLicense,
    updateLicense,
} from './models/license'
import { revokeSessionToken } from './models/session'
import {
    createUser,
    deleteUser,
    revokeAllUserSessions,
    updateUser,
} from './models/user'
import { revokeWebhook } from './models/webhook'
import { Payload } from './types'
import { kebabToCamel } from './util'

export const Webhooks = (payload: Payload): Promise<Function> => {
    const hooks = {
        createUser: (): Promise<Omit<User, 'password'>> => createUser(payload),
        updateUser: async (): Promise<Omit<User, 'password'>> =>
            updateUser(payload?.userId ?? 0, payload),
        deleteUser: async (): Promise<boolean> =>
            deleteUser(payload?.userId ?? 0),
        createLicense: async (): Promise<Omit<User, 'password'>> =>
            createLicenseForUser(payload?.userId ?? 0, payload),
        updateLicense: async (): Promise<Omit<User, 'password'>> =>
            updateLicense(payload?.licenseId ?? 0, payload),
        deleteLicense: async (): Promise<Omit<User, 'password'>> =>
            deleteLicense(payload?.licenseId ?? 0),
        revokeSession: async (): Promise<Omit<User, 'password'>> =>
            revokeSessionToken(payload?.sessionId ?? 0),
        revokeAllUserSessions: async (): Promise<Omit<User, 'password'>> =>
            revokeAllUserSessions(payload),
        revokeWebhook: async (): Promise<Omit<User, 'password'>> =>
            revokeWebhook(payload?.webhookId ?? 0),
    }
    return new Promise((resolve, reject) => {
        const action = kebabToCamel(payload?.action)
        if (!Object.getOwnPropertyNames(hooks).includes(action)) {
            reject(new Error('Action not found'))
        }
        resolve(hooks[action as keyof typeof hooks])
    })
}
