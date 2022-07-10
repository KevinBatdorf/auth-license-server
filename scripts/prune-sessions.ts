import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TODO find all users with non-expired, active licenses
// And make sure they don't have more sessions than
// their license permits. This is useful for catching licenses
// as they expire, and will essentially just log out the user

(async () => {
    console.log();
})();
