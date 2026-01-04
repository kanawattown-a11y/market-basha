import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { loginSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validationResult = loginSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { message: validationResult.error.errors[0].message },
                { status: 400 }
            );
        }

        const { identifier, password } = validationResult.data;

        // Attempt login
        const result = await login(identifier, password);

        if (!result.success) {
            // Log failed attempt
            await createAuditLog({
                action: 'LOGIN',
                entity: 'USER',
                newData: { identifier, success: false, reason: result.message },
                ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
                userAgent: request.headers.get('user-agent') || undefined,
            });

            return NextResponse.json(
                { message: result.message },
                { status: 401 }
            );
        }

        // Log successful login
        await createAuditLog({
            userId: result.user!.id,
            action: 'LOGIN',
            entity: 'USER',
            entityId: result.user!.id,
            newData: { success: true },
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
            userAgent: request.headers.get('user-agent') || undefined,
        });

        return NextResponse.json({
            message: result.message,
            user: result.user,
        });
    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في الخادم' },
            { status: 500 }
        );
    }
}
