import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { uploadToS3, isValidImageType, isValidFileSize } from '@/lib/s3';

// POST /api/upload - Upload file to S3
export async function POST(request: NextRequest) {
    try {
        const user = await getSession();

        if (!user || !['ADMIN', 'OPERATIONS'].includes(user.role)) {
            return NextResponse.json(
                { message: 'غير مصرح لك بهذا الإجراء' },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || 'products';

        if (!file) {
            return NextResponse.json(
                { message: 'لم يتم إرسال ملف' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!isValidImageType(file.type)) {
            return NextResponse.json(
                { message: 'نوع الملف غير مدعوم. يرجى استخدام JPG, PNG, WebP أو GIF' },
                { status: 400 }
            );
        }

        // File size check removed - no limit

        // Convert to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to S3
        const url = await uploadToS3(
            buffer,
            folder as 'products' | 'avatars' | 'offers' | 'categories' | 'tickets',
            file.name,
            file.type
        );

        return NextResponse.json({
            message: 'تم رفع الملف بنجاح',
            url,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في رفع الملف' },
            { status: 500 }
        );
    }
}
