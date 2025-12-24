import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import OperationsSidebar from '@/components/operations/OperationsSidebar';

export default async function OperationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getSession();

    if (!user) {
        redirect('/login');
    }

    if (!['ADMIN', 'OPERATIONS'].includes(user.role)) {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <OperationsSidebar user={user} />
            {/* Mobile padding for fixed header */}
            <div className="lg:mr-64 pt-14 lg:pt-0">
                <main className="p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
