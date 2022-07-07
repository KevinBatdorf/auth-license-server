import { User } from '@prisma/client'
import { createUser } from './models/user'
import { Payload } from './types'
import { kebabToCamel } from './util'

export const Webhooks = (payload: Payload): Promise<Function> => {
    const hooks = {
        createUser: (): Promise<User> => createUser(payload),
        updateUser: async (): Promise<boolean> => {
            return true
        },
        deleteUser: async (): Promise<boolean> => {
            return true
        },
        createLicense: async (): Promise<boolean> => {
            return true
        },
        updateLicense: async (): Promise<boolean> => {
            return true
        },
        deleteLicense: async (): Promise<boolean> => {
            return true
        },
        deleteSession: async (): Promise<boolean> => {
            return true
        },
        deleteWebhook: async (): Promise<boolean> => {
            return true
        },
    }
    return new Promise((resolve, reject) => {
        const action = kebabToCamel(payload?.action)
        if (!Object.getOwnPropertyNames(hooks).includes(action)) {
            reject(new Error('Action not found'))
        }
        resolve(hooks[action as keyof typeof hooks])
    })
}
