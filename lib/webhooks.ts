import { License, User } from '@prisma/client'
import {
    createLicenseForUser,
    deleteLicense,
    updateLicense,
} from './models/license'
import { deleteSession, revokeSessionToken } from './models/session'
import {
    createUser,
    deleteUser,
    revokeAllUserSessions,
    updateUser,
} from './models/user'
import { deleteWebhook } from './models/webhook'
import { Payload } from './types'
import { kebabToCamel } from './util'

export const Webhooks = (payload: Payload): Promise<Function> => {
    const hooks = {
        createUser: (): Promise<Omit<User, 'password'>> => createUser(payload),
        updateUser: async (): Promise<Omit<User, 'password'>> =>
            updateUser(payload?.id ?? 0, payload),
        deleteUser: async (): Promise<boolean> => deleteUser(payload?.id ?? 0),
        createLicense: async (): Promise<boolean> =>
            createLicenseForUser(payload?.id ?? 0, payload),
        updateLicense: async (): Promise<License> =>
            updateLicense(payload?.licenseId ?? 0, payload),
        deleteLicense: async (): Promise<boolean> =>
            deleteLicense(payload?.licenseId ?? 0),
        revokeSession: async (): Promise<boolean> =>
            revokeSessionToken(payload?.sessionId ?? 0),
        revokeAllUserSessions: async (): Promise<boolean> =>
            revokeAllUserSessions({ userId: payload.id }),
        deleteSession: async (): Promise<boolean> =>
            deleteSession(payload?.sessionId ?? 0),
        deleteWebhook: async (): Promise<boolean> =>
            deleteWebhook(payload?.webhookId ?? 0),
    }
    return new Promise((resolve, reject) => {
        const action = kebabToCamel(payload?.action)
        if (!Object.getOwnPropertyNames(hooks).includes(action)) {
            reject(new Error('Action not found'))
        }
        resolve(hooks[action as keyof typeof hooks])
    })
}
