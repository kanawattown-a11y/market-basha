import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DriverSidebar from '@/components/driver/DriverSidebar';

export default async function DriverLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getSession();

    if (!user) {
        redirect('/login');
    }

    if (user.role !== 'DRIVER') {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DriverSidebar user={user} />
            {/* Mobile padding for fixed header */}
            <div className="lg:mr-64 pt-14 lg:pt-0">
                <main className="p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
