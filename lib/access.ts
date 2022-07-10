import Cors from 'cors';

/* Allow only specific methods or origins */
export const cors = (req: any, res: any, options: {}) =>
    new Promise((resolve, reject) => {
        const middleware = Cors(options);
        middleware(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });

type methods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
/* Allow only specific methods */
export const method = (req: any, res: any, options: { methods: methods[] }) =>
    new Promise((resolve, reject) => {
        if (!options?.methods?.includes(req.method)) {
            res.status(405).json({ error: 'Method not allowed' });
            return reject();
        }
        return resolve('OK');
    });
