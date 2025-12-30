import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/contexts/CartContext';
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

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl" suppressHydrationWarning>
            <body className="font-cairo antialiased" suppressHydrationWarning>
                <CartProvider>
                    <NotificationAutoRegister />
                    {children}
                </CartProvider>
            </body>
        </html>
    );
}

