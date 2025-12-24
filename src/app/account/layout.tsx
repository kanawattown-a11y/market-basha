import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import {
    User,
    MapPin,
    ShoppingBag,
    Ticket,
    Settings,
    LogOut,
    ChevronLeft
} from 'lucide-react';

const menuItems = [
    { href: '/account', label: 'الملف الشخصي', icon: User },
    { href: '/account/addresses', label: 'العناوين', icon: MapPin },
    { href: '/account/orders', label: 'طلباتي', icon: ShoppingBag },
    { href: '/account/tickets', label: 'تذاكر الدعم', icon: Ticket },
    { href: '/account/settings', label: 'الإعدادات', icon: Settings },
];

export default async function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getSession();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 md:w-12 md:h-12 relative transition-transform duration-300 group-hover:scale-105">
                                <img src="/logo.svg" alt="ماركت باشا" className="w-full h-full object-contain" />
                            </div>
                            <span className="font-bold text-secondary-800 hidden sm:block text-xl tracking-tight group-hover:text-primary transition-colors">ماركت باشا</span>
                        </Link>
                        <ChevronLeft className="w-4 h-4 text-gray-400" />
                        <span className="text-secondary-800 font-medium">حسابي</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="card p-4">
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="text-primary font-bold text-xl">
                                        {user.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-bold text-secondary-800">{user.name}</p>
                                    <p className="text-sm text-gray-500">{user.phone}</p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                ))}

                                <form action="/api/auth/logout" method="POST">
                                    <button
                                        type="submit"
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span>تسجيل الخروج</span>
                                    </button>
                                </form>
                            </nav>
                        </div>
                    </aside>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
