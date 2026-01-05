import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
    console.log('🗑️  Starting database cleanup...');

    try {
        // Order matters! Delete in reverse order of dependencies

        console.log('Deleting AuditLogs...');
        await prisma.auditLog.deleteMany({});

        console.log('Deleting PushSubscriptions...');
        await prisma.pushSubscription.deleteMany({});

        console.log('Deleting Notifications...');
        await prisma.notification.deleteMany({});

        console.log('Deleting TicketMessages...');
        await prisma.ticketMessage.deleteMany({});

        console.log('Deleting Tickets...');
        await prisma.ticket.deleteMany({});

        console.log('Deleting Reviews...');
        await prisma.review.deleteMany({});

        console.log('Deleting OrderItems...');
        await prisma.orderItem.deleteMany({});

        console.log('Deleting Orders...');
        await prisma.order.deleteMany({});

        console.log('Deleting OfferProducts...');
        await prisma.offerProduct.deleteMany({});

        console.log('Deleting Offers...');
        await prisma.offer.deleteMany({});

        console.log('Deleting ProductServiceAreas...');
        await prisma.productServiceArea.deleteMany({});

        console.log('Deleting Products...');
        await prisma.product.deleteMany({});

        console.log('Deleting Categories...');
        await prisma.category.deleteMany({});

        console.log('Deleting Addresses...');
        await prisma.address.deleteMany({});

        console.log('Deleting Users...');
        await prisma.user.deleteMany({});

        console.log('Deleting ServiceAreas...');
        await prisma.serviceArea.deleteMany({});

        console.log('Deleting Settings...');
        await prisma.settings.deleteMany({});

        console.log('✅ Database cleared successfully!');
    } catch (error) {
        console.error('❌ Error clearing database:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

clearDatabase();
