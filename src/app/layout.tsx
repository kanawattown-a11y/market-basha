import type { Metadata, Viewport } from 'next';
import './globals.css';

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
        icon: '/favicon.ico',
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
                {children}
            </body>
        </html>
    );
}
