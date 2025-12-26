import { NextRequest, NextResponse } from 'next/server';
import { register } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { registerSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validationResult = registerSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { message: validationResult.error.errors[0].message },
                { status: 400 }
            );
        }

        const { name, phone, email, password, serviceAreaId } = validationResult.data;

        // Attempt registration
        const result = await register({ name, phone, email, password, serviceAreaId });

        if (!result.success) {
            return NextResponse.json(
                { message: result.message },
                { status: 400 }
            );
        }

        // Log registration
        await createAuditLog({
            action: 'CREATE',
            entity: 'User',
            newData: { name, phone, email: email || null, status: 'PENDING' },
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
            userAgent: request.headers.get('user-agent') || undefined,
        });

        return NextResponse.json({
            message: result.message,
        });
    } catch (error) {
        console.error('Register API error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في الخادم' },
            { status: 500 }
        );
    }
}
