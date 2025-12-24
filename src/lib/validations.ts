import { z } from 'zod';

// التحقق من رقم الهاتف السوري (يجب أن يبدأ بـ +963)
const syrianPhoneRegex = /^\+9639\d{8}$/;

// التسجيل
export const registerSchema = z.object({
    name: z.string()
        .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
        .max(100, 'الاسم طويل جداً'),
    email: z.string()
        .email('البريد الإلكتروني غير صالح')
        .optional()
        .or(z.literal('')),
    phone: z.string()
        .regex(syrianPhoneRegex, 'رقم الهاتف غير صالح'),
    password: z.string()
        .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
        .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
        .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير')
        .regex(/[0-9]/, 'يجب أن تحتوي على رقم'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
});

// تسجيل الدخول
export const loginSchema = z.object({
    identifier: z.string()
        .min(1, 'يرجى إدخال رقم الهاتف أو البريد الإلكتروني'),
    password: z.string()
        .min(1, 'يرجى إدخال كلمة المرور'),
});

// المنتج
export const productSchema = z.object({
    name: z.string()
        .min(2, 'اسم المنتج يجب أن يكون حرفين على الأقل')
        .max(200, 'اسم المنتج طويل جداً'),
    nameEn: z.string().optional(),
    description: z.string().max(2000, 'الوصف طويل جداً').optional(),
    descriptionEn: z.string().optional(),
    price: z.number()
        .positive('السعر يجب أن يكون أكبر من صفر'),
    compareAtPrice: z.number().min(0).optional().nullable(),
    costPrice: z.number().min(0).optional().nullable(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    stock: z.number().int().min(0, 'الكمية لا يمكن أن تكون سالبة'),
    lowStockThreshold: z.number().int().min(0).default(10),
    trackStock: z.boolean().default(true),
    unit: z.string().default('قطعة'),
    weight: z.number().positive().optional().nullable(),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    categoryId: z.string().min(1, 'يرجى اختيار الفئة'),
    image: z.string().optional().nullable(),
    images: z.array(z.string()).optional(),
});

// الفئة
export const categorySchema = z.object({
    name: z.string()
        .min(2, 'اسم الفئة يجب أن يكون حرفين على الأقل')
        .max(100, 'اسم الفئة طويل جداً'),
    nameEn: z.string().optional(),
    description: z.string().max(500).optional(),
    parentId: z.string().optional().nullable(),
    sortOrder: z.number().int().default(0),
    isActive: z.boolean().default(true),
    image: z.string().optional().nullable(),
});

// العنوان
export const addressSchema = z.object({
    title: z.string()
        .min(2, 'عنوان المكان يجب أن يكون حرفين على الأقل')
        .max(50, 'عنوان المكان طويل جداً'),
    fullAddress: z.string()
        .min(10, 'العنوان يجب أن يكون 10 أحرف على الأقل')
        .max(500, 'العنوان طويل جداً'),
    area: z.string()
        .min(2, 'يرجى تحديد المنطقة'),
    street: z.string().optional(),
    building: z.string().optional(),
    floor: z.string().optional(),
    notes: z.string().max(500).optional(),
    isDefault: z.boolean().default(false),
});

// الطلب
export const orderSchema = z.object({
    addressId: z.string().min(1, 'يرجى اختيار عنوان التوصيل'),
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().positive('الكمية يجب أن تكون أكبر من صفر'),
        notes: z.string().optional(),
    })).min(1, 'يجب إضافة منتج واحد على الأقل'),
    notes: z.string().max(500).optional(),
});

// التذكرة
export const ticketSchema = z.object({
    subject: z.string()
        .min(5, 'الموضوع يجب أن يكون 5 أحرف على الأقل')
        .max(200, 'الموضوع طويل جداً'),
    message: z.string()
        .min(10, 'الرسالة يجب أن تكون 10 أحرف على الأقل')
        .max(2000, 'الرسالة طويلة جداً'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

// رسالة التذكرة
export const ticketMessageSchema = z.object({
    message: z.string()
        .min(1, 'يرجى كتابة الرسالة')
        .max(2000, 'الرسالة طويلة جداً'),
});

// العرض
export const offerSchema = z.object({
    title: z.string()
        .min(3, 'عنوان العرض يجب أن يكون 3 أحرف على الأقل')
        .max(200, 'عنوان العرض طويل جداً'),
    titleEn: z.string().optional(),
    description: z.string().max(1000).optional(),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.number().positive('قيمة الخصم يجب أن تكون أكبر من صفر'),
    minOrderAmount: z.number().min(0).optional().nullable(),
    startDate: z.date(),
    endDate: z.date(),
    isActive: z.boolean().default(true),
    productIds: z.array(z.string()).optional(),
}).refine((data) => data.endDate > data.startDate, {
    message: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية',
    path: ['endDate'],
});

// منطقة التخديم
export const serviceAreaSchema = z.object({
    name: z.string()
        .min(2, 'اسم المنطقة يجب أن يكون حرفين على الأقل')
        .max(100, 'اسم المنطقة طويل جداً'),
    nameEn: z.string().optional(),
    deliveryFee: z.number().min(0, 'رسوم التوصيل لا يمكن أن تكون سالبة'),
    isActive: z.boolean().default(true),
});

// تحديث المستخدم
export const updateUserSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().regex(syrianPhoneRegex).optional(),
    role: z.enum(['ADMIN', 'OPERATIONS', 'DRIVER', 'USER']).optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']).optional(),
    vehicleType: z.string().optional(),
    vehiclePlate: z.string().optional(),
    isAvailable: z.boolean().optional(),
});

// تغيير كلمة المرور
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'يرجى إدخال كلمة المرور الحالية'),
    newPassword: z.string()
        .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
        .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
        .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير')
        .regex(/[0-9]/, 'يجب أن تحتوي على رقم'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
});

// Types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type TicketInput = z.infer<typeof ticketSchema>;
export type TicketMessageInput = z.infer<typeof ticketMessageSchema>;
export type OfferInput = z.infer<typeof offerSchema>;
export type ServiceAreaInput = z.infer<typeof serviceAreaSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
