import { NextApiRequest, NextApiResponse } from 'next';
import { cors, method } from '@/lib/access';
import { getUserWithPasswordBy } from '@/lib/models/user';
import {
    comparePasswords,
    createTokenCookie,
    signRefreshToken,
    signAccessToken,
} from '@/lib/auth';
import { createSessionForUser, updateSessionToken } from '@/lib/models/session';
import { getUnusedLicenses } from '@/lib/util';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await cors(req, res, { methods: ['POST'] });
    await method(req, res, { methods: ['POST'] });

    const { email, password } = req.body;
    const { country, city, region, limited = false } = req.query;

    const user = await getUserWithPasswordBy({ email }).catch(() => {
        res.status(401).send({ error: 'Invalid credentials' });
    });
    if (!user) return;

    // Check password is set
    if (!user?.password) {
        res.status(401).send({ error: 'Password not set' });
        return;
    }

    // Check password
    if (!password || !(await comparePasswords(password, user.password))) {
        res.status(401).send({ error: 'Invalid credentials' });
        return;
    }

    // Check how many unused licenses are available
    // If no licenses are available, we will stil create a session
    // And in the token mark the access as limited
    const unusedLicenses = getUnusedLicenses(user);

    // Create session db item and add to user
    const session = await createSessionForUser(user.id, {
        userAgent: req.headers['user-agent'],
        host: req.headers['host'],
        country: country ? country.toString() : undefined,
        city: city ? city.toString() : undefined,
        region: region ? region.toString() : undefined,
        limited: Boolean(limited) || unusedLicenses === 0,
    });

    // Create refresh token to place in cookie
    const refreshToken = await signRefreshToken('180d', {
        userId: user.id,
        status: user.status,
        role: user.role,
        sessionId: session.id,
        limited: Boolean(limited) || unusedLicenses === 0,
    });

    // Add the token back into the session item
    await updateSessionToken(session.id, refreshToken);

    // Set the cookie 180 days
    res.setHeader(
        'Set-Cookie',
        await createTokenCookie(refreshToken, 15_552_000),
    );

    // Create the access token
    const accessToken = await signAccessToken('10m', {
        userId: user.id,
        status: user.status,
        role: user.role,
        limited: Boolean(limited) || unusedLicenses === 0,
    });

    // Send the access token and refresh token back
    res.status(200).send({
        remainingLicenses: Math.max(unusedLicenses - 1, 0),
        accessToken,
        refreshToken,
    });
}
