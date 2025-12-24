import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'eu-west-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'market-basha-uploads';

export type UploadFolder = 'products' | 'avatars' | 'offers' | 'categories' | 'tickets';

// رفع ملف إلى S3
export async function uploadToS3(
    file: Buffer,
    folder: UploadFolder,
    fileName: string,
    contentType: string
): Promise<string> {
    const key = `${folder}/${uuidv4()}-${fileName}`;

    await s3Client.send(
        new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file,
            ContentType: contentType,
            CacheControl: 'max-age=31536000',
        })
    );

    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

// حذف ملف من S3
export async function deleteFromS3(url: string): Promise<void> {
    try {
        const key = url.split('.amazonaws.com/')[1];
        if (!key) return;

        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            })
        );
    } catch (error) {
        console.error('Error deleting from S3:', error);
    }
}

// الحصول على رابط مؤقت للرفع (للـ Client-side uploads)
export async function getPresignedUploadUrl(
    folder: UploadFolder,
    fileName: string,
    contentType: string
): Promise<{ uploadUrl: string; fileUrl: string }> {
    const key = `${folder}/${uuidv4()}-${fileName}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return { uploadUrl, fileUrl };
}

// الحصول على رابط مؤقت للتحميل
export async function getPresignedDownloadUrl(url: string): Promise<string> {
    const key = url.split('.amazonaws.com/')[1];
    if (!key) return url;

    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

// التحقق من نوع الملف
export function isValidImageType(contentType: string): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    return validTypes.includes(contentType);
}

// التحقق من حجم الملف (5MB max)
export function isValidFileSize(size: number, maxSizeMB: number = 5): boolean {
    return size <= maxSizeMB * 1024 * 1024;
}
