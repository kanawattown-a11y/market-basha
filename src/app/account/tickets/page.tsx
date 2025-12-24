'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Ticket, Clock, CheckCircle, XCircle, MessageCircle } from 'lucide-react';

export default function AccountTicketsPage() {
    // This is a simplified version - in production, fetch from API
    const [tickets] = useState([
        { id: '1', ticketNumber: 'TK-001', subject: 'مشكلة في التوصيل', status: 'OPEN', createdAt: '2024-01-15' },
        { id: '2', ticketNumber: 'TK-002', subject: 'استفسار عن منتج', status: 'RESOLVED', createdAt: '2024-01-10' },
    ]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'OPEN': return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'IN_PROGRESS': return <MessageCircle className="w-4 h-4 text-blue-500" />;
            case 'RESOLVED': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'CLOSED': return <XCircle className="w-4 h-4 text-gray-500" />;
            default: return null;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'OPEN': return 'مفتوحة';
            case 'IN_PROGRESS': return 'قيد المعالجة';
            case 'RESOLVED': return 'تم الحل';
            case 'CLOSED': return 'مغلقة';
            default: return status;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-secondary-800">تذاكر الدعم</h1>
                <Link href="/support/new" className="btn btn-primary btn-sm">
                    تذكرة جديدة
                </Link>
            </div>

            {tickets.length === 0 ? (
                <div className="card p-12 text-center">
                    <Ticket className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">لا توجد تذاكر</p>
                    <Link href="/support/new" className="btn btn-primary">
                        إنشاء تذكرة جديدة
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map((ticket) => (
                        <Link
                            key={ticket.id}
                            href={`/support/${ticket.id}`}
                            className="card p-4 block hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        {getStatusIcon(ticket.status)}
                                        <span className="text-xs text-gray-400">#{ticket.ticketNumber}</span>
                                    </div>
                                    <h3 className="font-semibold text-secondary-800">{ticket.subject}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {getStatusLabel(ticket.status)} • {ticket.createdAt}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
