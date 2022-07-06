import { User } from '@prisma/client'

// try/catch over the incoming action function in a way where if
// it doesn't exist it will return a 404
// create-user
// Send the user an email with a 30m token
//
// update-user
// allow a password to be updated and status to be updated
// delete-user
// a way to completely delete a user (alternative to setting status to INACTIVE)
//
//

import { createUser } from './models/user'
import { Payload } from './types'
import { kebabToCamel } from './util'

// backup-database
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
