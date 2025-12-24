import Link from 'next/link';
import { Home, ArrowRight } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-5xl font-bold text-primary">404</span>
                </div>

                <h1 className="text-2xl font-bold text-secondary-800 mb-2">
                    الصفحة غير موجودة
                </h1>

                <p className="text-gray-500 mb-6">
                    عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
                </p>

                <Link href="/" className="btn btn-primary">
                    <Home className="w-5 h-5" />
                    العودة للرئيسية
                </Link>
            </div>
        </div>
    );
}
