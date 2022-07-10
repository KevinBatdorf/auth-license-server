import { randomPassword, validateEmailAddress } from '../lib/auth';
import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { excludeFields } from '../lib/util';

const prisma = new PrismaClient();

const [email, name] = process.argv.slice(3);
if (!email) {
    console.error('Email is missing');
    process.exit(1);
}
if (!validateEmailAddress(email)) {
    console.error('Email is invalid');
    process.exit(1);
}
if (!name) {
    console.error('Name is missing');
    process.exit(1);
}

(async () => {
    const salt = bcrypt.genSaltSync();
    const user = await prisma.user.create({
        data: {
            email,
            name,
            // Password reset will be mailed
            password: bcrypt.hashSync(randomPassword(), salt),
            role: 'ADMIN',
        },
    });
    console.log(excludeFields(user, 'password'));
})()
    .catch((e) => {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            // The .code property can be accessed in a type-safe manner
            if (e.code === 'P2002') {
                console.log(
                    'There is a unique constraint violation, a new user cannot be created with this email',
                );
            }
        }
    })
    .finally(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
