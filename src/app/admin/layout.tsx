import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getSession();

    if (!user) {
        redirect('/login');
    }

    if (user.role !== 'ADMIN') {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar user={user} />
            <div className="flex-1 flex flex-col lg:mr-64">
                <AdminHeader user={user} />
                <main className="flex-1 p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
