import { prisma } from '@/lib/prisma';
import { formatDateTime } from '@/lib/utils';
import { ClipboardList, User, Calendar, Eye } from 'lucide-react';

export default async function AdminAuditPage() {
    const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
            user: {
                select: { name: true },
            },
        },
    });

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'bg-green-100 text-green-700';
            case 'UPDATE': return 'bg-blue-100 text-blue-700';
            case 'DELETE': return 'bg-red-100 text-red-700';
            case 'LOGIN': return 'bg-purple-100 text-purple-700';
            case 'LOGOUT': return 'bg-gray-100 text-gray-700';
            case 'STATUS_CHANGE': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const translateAction = (action: string) => {
        const actions: Record<string, string> = {
            CREATE: 'إنشاء',
            UPDATE: 'تحديث',
            DELETE: 'حذف',
            LOGIN: 'تسجيل دخول',
            LOGOUT: 'تسجيل خروج',
            STATUS_CHANGE: 'تغيير حالة',
            VIEW: 'عرض',
            EXPORT: 'تصدير',
        };
        return actions[action] || action;
    };

    const translateEntity = (entity: string) => {
        const entities: Record<string, string> = {
            User: 'مستخدم',
            Product: 'منتج',
            Category: 'متجر',
            Order: 'طلب',
            Ticket: 'تذكرة',
            Offer: 'عرض',
            Address: 'عنوان',
            ServiceArea: 'منطقة',
        };
        return entities[entity] || entity;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-secondary-800">سجل العمليات</h1>
                <p className="text-gray-500">عرض جميع العمليات على النظام</p>
            </div>

            {logs.length === 0 ? (
                <div className="card p-12 text-center">
                    <ClipboardList className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">لا توجد عمليات مسجلة</p>
                </div>
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>المستخدم</th>
                                    <th>العملية</th>
                                    <th>الكيان</th>
                                    <th>التفاصيل</th>
                                    <th>التاريخ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id}>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                {log.user?.name || 'غير معروف'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${getActionColor(log.action)}`}>
                                                {translateAction(log.action)}
                                            </span>
                                        </td>
                                        <td>{translateEntity(log.entity)}</td>
                                        <td className="max-w-xs truncate text-gray-500 text-sm">
                                            {log.entityId}
                                        </td>
                                        <td className="text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDateTime(log.createdAt.toISOString())}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
