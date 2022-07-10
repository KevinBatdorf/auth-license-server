import { PrismaClient } from '@prisma/client';
import { production } from './constants';

declare global {
    // allow global `var` declarations
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

export const prisma =
    global.prisma ||
    new PrismaClient({
        log: ['query'],
    });

if (!production) global.prisma = prisma;
