import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { UserRole, UserStatus } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '90d';

export interface TokenPayload extends JWTPayload {
    userId: string;
    role: UserRole;
    status: UserStatus;
}

export interface SessionUser {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    role: UserRole;
    status: UserStatus;
    avatar: string | null;
}

// تشفير كلمة المرور
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

// التحقق من كلمة المرور
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

// إنشاء JWT Token
export async function createToken(payload: TokenPayload): Promise<string> {
    const expiresIn = JWT_EXPIRES_IN.endsWith('d')
        ? parseInt(JWT_EXPIRES_IN) * 24 * 60 * 60
        : parseInt(JWT_EXPIRES_IN) * 60 * 60;

    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${expiresIn}s`)
        .sign(JWT_SECRET);
}

// التحقق من Token
export async function verifyToken(token: string): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as TokenPayload;
    } catch {
        return null;
    }
}

// الحصول على الجلسة الحالية
export async function getSession(): Promise<SessionUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) return null;

        const payload = await verifyToken(token);
        if (!payload) return null;

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                avatar: true,
            },
        });

        return user;
    } catch {
        return null;
    }
}

// تسجيل الدخول
export async function login(identifier: string, password: string): Promise<{ success: boolean; message: string; user?: SessionUser }> {
    try {
        // البحث بالبريد الإلكتروني أو رقم الهاتف
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier },
                ],
            },
        });

        if (!user) {
            return { success: false, message: 'بيانات الدخول غير صحيحة' };
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return { success: false, message: 'بيانات الدخول غير صحيحة' };
        }

        if (user.status === 'PENDING') {
            return { success: false, message: 'حسابك قيد المراجعة، يرجى انتظار موافقة الإدارة' };
        }

        if (user.status === 'REJECTED') {
            return { success: false, message: 'تم رفض طلب التسجيل الخاص بك' };
        }

        if (user.status === 'SUSPENDED') {
            return { success: false, message: 'تم تعليق حسابك، يرجى التواصل مع الإدارة' };
        }

        // إنشاء Token
        const token = await createToken({
            userId: user.id,
            role: user.role,
            status: user.status,
        });

        // حفظ Token في Cookie
        const cookieStore = await cookies();
        cookieStore.set('auth-token', token, {
            httpOnly: true,
            // Allow HTTP for development/local network testing on mobile
            // Only force secure in strict production if not overridden
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 90, // 90 days
            path: '/',
        });

        // تحديث آخر تسجيل دخول
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        return {
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
                avatar: user.avatar,
            },
        };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' };
    }
}

// تسجيل الخروج
export async function logout(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
}

// تسجيل مستخدم جديد
export async function register(data: {
    name: string;
    email?: string;
    phone: string;
    password: string;
}): Promise<{ success: boolean; message: string }> {
    try {
        // التحقق من عدم وجود المستخدم
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { phone: data.phone },
                    ...(data.email ? [{ email: data.email }] : []),
                ],
            },
        });

        if (existingUser) {
            return { success: false, message: 'رقم الهاتف أو البريد الإلكتروني مستخدم مسبقاً' };
        }

        // تشفير كلمة المرور
        const hashedPassword = await hashPassword(data.password);

        // إنشاء المستخدم
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email || null,
                phone: data.phone,
                password: hashedPassword,
                role: 'USER',
                status: 'PENDING',
            },
        });

        // إنشاء إشعار للأدمن
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN', status: 'APPROVED' },
        });

        for (const admin of admins) {
            await prisma.notification.create({
                data: {
                    userId: admin.id,
                    type: 'NEW_USER',
                    title: 'مستخدم جديد',
                    message: `قام ${data.name} بالتسجيل ويحتاج للموافقة`,
                    data: { userId: user.id },
                },
            });
        }

        return { success: true, message: 'تم التسجيل بنجاح، يرجى انتظار موافقة الإدارة' };
    } catch (error) {
        console.error('Register error:', error);
        return { success: false, message: 'حدث خطأ أثناء التسجيل' };
    }
}

// التحقق من الصلاحيات
export function hasRole(user: SessionUser | null, roles: UserRole[]): boolean {
    if (!user) return false;
    return roles.includes(user.role);
}

// التحقق من أن المستخدم مفعل
export function isApproved(user: SessionUser | null): boolean {
    if (!user) return false;
    return user.status === 'APPROVED';
}
