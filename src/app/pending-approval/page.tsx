import Link from 'next/link';
import { Clock, Mail, Phone } from 'lucide-react';

export default function PendingApprovalPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="card p-8 text-center">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-yellow-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-secondary-800 mb-2">
                        حسابك قيد المراجعة
                    </h1>

                    <p className="text-gray-500 mb-6">
                        تم تسجيل حسابك بنجاح وهو الآن قيد المراجعة من قبل فريق الإدارة.
                        سيتم إشعارك عند تفعيل حسابك.
                    </p>

                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <h3 className="font-semibold text-secondary-800 mb-3">هل تحتاج مساعدة؟</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-center gap-2 text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span dir="ltr">+963 912 345 678</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>support@marketbasha.com</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Link href="/" className="btn btn-primary w-full">
                            العودة للرئيسية
                        </Link>
                        <form action="/api/auth/logout" method="POST">
                            <button type="submit" className="btn btn-outline w-full">
                                تسجيل الخروج
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
