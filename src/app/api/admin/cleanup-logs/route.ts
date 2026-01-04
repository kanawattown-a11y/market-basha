import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { scheduleAuditLogCleanup } from '@/lib/cron';

// POST /api/admin/cleanup-logs - Manual audit log cleanup
export async function POST(request: NextRequest) {
    try {
        const user = await getSession();

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { message: 'غير مصرح لك بهذا الإجراء' },
                { status: 403 }
            );
        }

        const result = await scheduleAuditLogCleanup();

        if (result.success) {
            return NextResponse.json({
                message: `تم حذف ${result.deletedCount} سجل قديم بنجاح`,
                deletedCount: result.deletedCount,
            });
        } else {
            return NextResponse.json(
                { message: 'حدث خطأ في تنظيف السجلات' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Cleanup logs error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في تنظيف السجلات' },
            { status: 500 }
        );
    }
}
