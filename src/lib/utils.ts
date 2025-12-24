// Utility functions

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combine class names with Tailwind merge
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Format number with Arabic locale
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('ar-SY').format(num);
}

// Format currency (Syrian Lira)
export function formatCurrency(amount: number): string {
    return `${formatNumber(amount)} ل.س`;
}

// Format date
export function formatDate(date: string | Date): string {
    const d = new Date(date);
    return new Intl.DateTimeFormat('ar-SY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(d);
}

// Format date and time
export function formatDateTime(date: string | Date): string {
    const d = new Date(date);
    return new Intl.DateTimeFormat('ar-SY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;

    return formatDate(d);
}

// Generate order number
export function generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${year}${month}-${random}`;
}

// Generate ticket number
export function generateTicketNumber(): string {
    const date = new Date();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TK-${random}`;
}

// Translate order status
export function translateOrderStatus(status: string): string {
    const statuses: Record<string, string> = {
        PENDING: 'معلق',
        CONFIRMED: 'مؤكد',
        PREPARING: 'قيد التجهيز',
        READY: 'جاهز',
        OUT_FOR_DELIVERY: 'في الطريق',
        DELIVERED: 'تم التوصيل',
        CANCELLED: 'ملغي',
        RETURNED: 'مرتجع',
    };
    return statuses[status] || status;
}

// Get order status color
export function getOrderStatusColor(status: string): string {
    const colors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-700',
        CONFIRMED: 'bg-blue-100 text-blue-700',
        PREPARING: 'bg-orange-100 text-orange-700',
        READY: 'bg-cyan-100 text-cyan-700',
        OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700',
        DELIVERED: 'bg-green-100 text-green-700',
        CANCELLED: 'bg-red-100 text-red-700',
        RETURNED: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
}

// Translate ticket status
export function translateTicketStatus(status: string): string {
    const statuses: Record<string, string> = {
        OPEN: 'مفتوحة',
        IN_PROGRESS: 'قيد المعالجة',
        RESOLVED: 'تم الحل',
        CLOSED: 'مغلقة',
    };
    return statuses[status] || status;
}

// Get ticket status color
export function getTicketStatusColor(status: string): string {
    const colors: Record<string, string> = {
        OPEN: 'bg-yellow-100 text-yellow-700',
        IN_PROGRESS: 'bg-blue-100 text-blue-700',
        RESOLVED: 'bg-green-100 text-green-700',
        CLOSED: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
}

// Translate user status
export function translateUserStatus(status: string): string {
    const statuses: Record<string, string> = {
        PENDING: 'قيد المراجعة',
        APPROVED: 'مفعل',
        REJECTED: 'مرفوض',
        SUSPENDED: 'موقوف',
    };
    return statuses[status] || status;
}

// Get user status color
export function getUserStatusColor(status: string): string {
    const colors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-700',
        APPROVED: 'bg-green-100 text-green-700',
        REJECTED: 'bg-red-100 text-red-700',
        SUSPENDED: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
}

// Translate role
export function translateRole(role: string): string {
    const roles: Record<string, string> = {
        ADMIN: 'مدير',
        OPERATIONS: 'عمليات',
        DRIVER: 'سائق',
        USER: 'مستخدم',
    };
    return roles[role] || role;
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Slugify text
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

// Validate phone number
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Validate email
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
