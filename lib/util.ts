import type { IncomingHttpHeaders } from 'http'

export const makeSessionName = (headers: IncomingHttpHeaders) => {
    return [headers['user-agent'], headers['host']].filter(Boolean).join(' ')
}
