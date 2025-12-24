import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating notification defaults for all users...');

    try {
        const result = await prisma.user.updateMany({
            data: {
                areNotificationsEnabled: true
            }
        });

        console.log(`Updated ${result.count} users successfully.`);
    } catch (error) {
        console.error('Error updating users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
