import { NextApiRequest, NextApiResponse } from 'next';
import { sendPasswordResetEmail } from '@/lib/email';
import { getUserBy } from '@/lib/models/user';
import { signEmailToken } from '@/lib/auth';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    // Start time
    const start = Date.now();

    // Check email exists
    const user = await getUserBy({ email: req.body.email }).catch(() => {
        // Do nothing on catch to let the timer run
    });

    if (user?.email && user?.id) {
        // generate email token and send email
        const { id: userId, email } = user;
        const token = await signEmailToken('30m', { userId, email });

        await sendPasswordResetEmail(email, token);
    }

    // Make sure 3 seconds have passed
    const timeLeft = Date.now() - start;
    if (timeLeft < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - timeLeft));
    }
    // Respond with success and generic message
    res.status(200).send({ success: true });
}
