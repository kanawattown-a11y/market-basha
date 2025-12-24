import { NextResponse } from 'next/server';
import { logout } from '@/lib/auth';

export async function POST() {
    try {
        await logout();
        return NextResponse.json({ message: 'تم تسجيل الخروج بنجاح' });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ أثناء تسجيل الخروج' },
            { status: 500 }
        );
    }
}
