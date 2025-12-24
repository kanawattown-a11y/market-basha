import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { formatDateTime } from '@/lib/utils';
import { User, Mail, Phone, Calendar, Edit } from 'lucide-react';
import Link from 'next/link';

export default async function AccountPage() {
    const session = await getSession();

    const user = await prisma.user.findUnique({
        where: { id: session!.id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            createdAt: true,
            _count: {
                select: {
                    orders: true,
                    addresses: true,
                    tickets: true,
                },
            },
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-secondary-800">الملف الشخصي</h1>
                <Link href="/account/edit" className="btn btn-outline btn-sm">
                    <Edit className="w-4 h-4" />
                    تعديل
                </Link>
            </div>

            <div className="card">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-bold text-3xl">
                                {user?.name.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-secondary-800">{user?.name}</h2>
                            <p className="text-gray-500">عميل منذ {formatDateTime(user?.createdAt || '')}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Phone className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">رقم الهاتف</p>
                            <p className="font-medium text-secondary-800" dir="ltr">{user?.phone}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                            <p className="font-medium text-secondary-800">{user?.email || 'غير محدد'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Link href="/account/orders" className="card p-4 text-center hover:shadow-md transition-shadow">
                    <p className="text-3xl font-bold text-primary">{user?._count.orders || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">طلب</p>
                </Link>
                <Link href="/account/addresses" className="card p-4 text-center hover:shadow-md transition-shadow">
                    <p className="text-3xl font-bold text-primary">{user?._count.addresses || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">عنوان</p>
                </Link>
                <Link href="/account/tickets" className="card p-4 text-center hover:shadow-md transition-shadow">
                    <p className="text-3xl font-bold text-primary">{user?._count.tickets || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">تذكرة</p>
                </Link>
            </div>
        </div>
    );
}
