import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/contexts/CartContext';
import { ToastProvider } from '@/contexts/ToastContext';
import NotificationAutoRegister from '@/components/NotificationAutoRegister';

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#FEC00F',
};

export const metadata: Metadata = {
    title: 'ماركت باشا - تسوق بسهولة',
    description: 'ماركت باشا - متجرك الإلكتروني للتسوق بسهولة وراحة، توصيل سريع ودفع عند الاستلام',
    keywords: 'ماركت باشا, تسوق, سوريا, توصيل, بقالة, سوبرماركت',
    authors: [{ name: 'Market Basha' }],
    icons: {
        icon: [
            { url: '/favicon.svg', type: 'image/svg+xml' },
            { url: '/favicon.ico', sizes: 'any' } // Fallback
        ],
        apple: '/favicon.svg',
    },
    manifest: '/manifest.json',
};

import { getSession } from '@/lib/auth';

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getSession();

    return (
        <html lang="ar" dir="rtl" suppressHydrationWarning>
            <body className="font-cairo antialiased" suppressHydrationWarning>
                <ToastProvider>
                    <CartProvider>
                        <NotificationAutoRegister user={user} />
                        {children}
                    </CartProvider>
                </ToastProvider>
            </body>
        </html>
    );
}

