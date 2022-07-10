import { NextApiRequest, NextApiResponse } from 'next';
import { cors, method } from '@/lib/access';
import { verifyAccessToken } from '@/lib/auth';
import { AccessTokenData } from '@/lib/types';
import { getUserBy, getUsersBy } from '@/lib/models/user';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await cors(req, res, {
        methods: ['GET'],
        // TODO: origin: 'https://my-website.com'
    });
    await method(req, res, { methods: ['GET'] });

    const accesstoken = req.headers.authorization;

    if (!accesstoken?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    // Check access token from header
    const data = await verifyAccessToken(accesstoken.substring(7)).catch(() => {
        res.status(401).send({ error: 'Invalid token token' });
    });
    if (!data) return;
    const { role, status } = data as AccessTokenData;

    if (role !== 'ADMIN' || status !== 'ACTIVE') {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    // TODO: accept pagination, sort, options, etc

    // Grab all users, or accept an id for users
    if (req.query?.userId) {
        const user = await getUserBy({ id: Number(req.query.userId) }).catch(
            () => {
                res.status(404).json({ error: 'User not found' });
            },
        );
        if (!user) return;
        res.status(200).json({ user });
        return;
    }

    // Just return all for now - later add pagination. etc
    const users = await getUsersBy({});
    res.status(200).send(users);
    return;
}
