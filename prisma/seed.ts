import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 بدء إنشاء البيانات الأولية...');

    // Create Admin User
    const adminPassword = await bcrypt.hash('Admin@123456', 12);
    const admin = await prisma.user.upsert({
        where: { phone: '+963912345678' },
        update: {},
        create: {
            name: 'مدير النظام',
            email: 'admin@marketbasha.com',
            phone: '+963912345678',
            password: adminPassword,
            role: 'ADMIN',
            status: 'APPROVED',
        },
    });
    console.log('✅ تم إنشاء حساب المدير:', admin.email);

    // Create Operations User
    const opsPassword = await bcrypt.hash('Operations@123', 12);
    const operations = await prisma.user.upsert({
        where: { phone: '+963923456789' },
        update: {},
        create: {
            name: 'مسؤول العمليات',
            email: 'operations@marketbasha.com',
            phone: '+963923456789',
            password: opsPassword,
            role: 'OPERATIONS',
            status: 'APPROVED',
        },
    });
    console.log('✅ تم إنشاء حساب العمليات:', operations.email);

    // Create Driver User
    const driverPassword = await bcrypt.hash('Driver@123456', 12);
    const driver = await prisma.user.upsert({
        where: { phone: '+963934567890' },
        update: {},
        create: {
            name: 'أحمد السائق',
            email: 'driver@marketbasha.com',
            phone: '+963934567890',
            password: driverPassword,
            role: 'DRIVER',
            status: 'APPROVED',
            vehicleType: 'دراجة نارية',
            vehiclePlate: '123456',
            isAvailable: true,
        },
    });
    console.log('✅ تم إنشاء حساب السائق:', driver.email);

    // Create Service Areas
    const areas = ['السويداء', 'قنوات', 'شهبا', 'صلخد', 'المزرعة'];
    for (const areaName of areas) {
        await prisma.serviceArea.upsert({
            where: { name: areaName },
            update: {},
            create: {
                name: areaName,
                deliveryFee: areaName === 'السويداء' ? 5000 : 10000,
                isActive: true,
            },
        });
    }
    console.log('✅ تم إنشاء مناطق التخديم:', areas.join(', '));

    // Create Categories
    const categories = [
        { name: 'خضروات وفواكه', sortOrder: 1 },
        { name: 'لحوم ودواجن', sortOrder: 2 },
        { name: 'ألبان وأجبان', sortOrder: 3 },
        { name: 'مخبوزات', sortOrder: 4 },
        { name: 'مشروبات', sortOrder: 5 },
        { name: 'حلويات', sortOrder: 6 },
        { name: 'منتجات منزلية', sortOrder: 7 },
        { name: 'معلبات', sortOrder: 8 },
    ];

    const createdCategories: Record<string, string> = {};
    for (const cat of categories) {
        const category = await prisma.category.upsert({
            where: { id: cat.name.replace(/\s+/g, '-') },
            update: {},
            create: {
                id: cat.name.replace(/\s+/g, '-'),
                name: cat.name,
                sortOrder: cat.sortOrder,
                isActive: true,
            },
        });
        createdCategories[cat.name] = category.id;
    }
    console.log('✅ تم إنشاء الأقسام:', categories.map(c => c.name).join(', '));

    // Create Sample Products
    const products = [
        { name: 'طماطم طازجة', price: 5000, category: 'خضروات وفواكه', unit: 'كيلو', stock: 100 },
        { name: 'خيار', price: 3000, category: 'خضروات وفواكه', unit: 'كيلو', stock: 80 },
        { name: 'بطاطا', price: 4000, category: 'خضروات وفواكه', unit: 'كيلو', stock: 150 },
        { name: 'تفاح أحمر', price: 8000, category: 'خضروات وفواكه', unit: 'كيلو', stock: 60, isFeatured: true },
        { name: 'موز', price: 12000, category: 'خضروات وفواكه', unit: 'كيلو', stock: 40 },
        { name: 'صدر دجاج', price: 35000, category: 'لحوم ودواجن', unit: 'كيلو', stock: 50, isFeatured: true },
        { name: 'لحم بقر مفروم', price: 65000, category: 'لحوم ودواجن', unit: 'كيلو', stock: 30 },
        { name: 'حليب طازج', price: 8000, category: 'ألبان وأجبان', unit: 'لتر', stock: 100 },
        { name: 'جبنة بيضاء', price: 15000, category: 'ألبان وأجبان', unit: 'كيلو', stock: 40 },
        { name: 'لبن', price: 5000, category: 'ألبان وأجبان', unit: 'لتر', stock: 80 },
        { name: 'خبز عربي', price: 2000, category: 'مخبوزات', unit: 'ربطة', stock: 200 },
        { name: 'كرواسان', price: 3000, category: 'مخبوزات', unit: 'قطعة', stock: 50 },
        { name: 'عصير برتقال', price: 10000, category: 'مشروبات', unit: 'لتر', stock: 60, isFeatured: true },
        { name: 'ماء معدني', price: 1500, category: 'مشروبات', unit: 'عبوة', stock: 300 },
        { name: 'بقلاوة', price: 50000, category: 'حلويات', unit: 'كيلو', stock: 20, isFeatured: true },
    ];

    for (const prod of products) {
        await prisma.product.upsert({
            where: { sku: prod.name.replace(/\s+/g, '-').toLowerCase() },
            update: {},
            create: {
                name: prod.name,
                sku: prod.name.replace(/\s+/g, '-').toLowerCase(),
                price: prod.price,
                stock: prod.stock,
                unit: prod.unit,
                categoryId: createdCategories[prod.category],
                isActive: true,
                isFeatured: prod.isFeatured || false,
                lowStockThreshold: 10,
                trackStock: true,
                createdById: admin.id,
            },
        });
    }
    console.log('✅ تم إنشاء', products.length, 'منتج');

    console.log('\n🎉 تم إنشاء البيانات الأولية بنجاح!');
    console.log('\nبيانات الدخول:');
    console.log('================');
    console.log('المدير: admin@marketbasha.com / Admin@123456');
    console.log('العمليات: operations@marketbasha.com / Operations@123');
    console.log('السائق: driver@marketbasha.com / Driver@123456');
}

main()
    .catch((e) => {
        console.error('❌ خطأ:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
