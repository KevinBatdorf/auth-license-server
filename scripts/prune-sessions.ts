import { getUnusedLicenses } from '../lib/util';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Find all users with non-expired, active licenses
// And make sure they don't have more sessions than
// their license permits (check for < 0). This is useful for
//catching licenses as they expire, and will essentially just
// log out the user everywhere

(async () => {
    const users = await prisma.user.findMany({
        include: {
            licenses: true,
            sessions: true,
        },
    });
    for (const user of users) {
        if (getUnusedLicenses(user) < 0) {
            console.log(`Removing sessions for user ${user.id}`);
            await prisma.session.updateMany({
                where: { userId: Number(user.id) },
                data: { updatedAt: new Date(), token: null },
            });
        }
    }
})();
