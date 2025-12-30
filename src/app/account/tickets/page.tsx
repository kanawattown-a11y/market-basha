'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Ticket, Clock, CheckCircle, XCircle, MessageCircle, Plus } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface TicketData {
    id: string;
    ticketNumber: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    messages: { id: string }[];
}

export default function AccountTicketsPage() {
    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await fetch('/api/tickets');
                if (res.ok) {
                    const data = await res.json();
                    setTickets(data.tickets);
                }
            } catch (error) {
                console.error('Error fetching tickets:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

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

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'HIGH': return <span className="badge bg-red-100 text-red-700 text-xs">عاجل</span>;
            case 'MEDIUM': return <span className="badge bg-yellow-100 text-yellow-700 text-xs">متوسط</span>;
            case 'LOW': return <span className="badge bg-gray-100 text-gray-600 text-xs">منخفض</span>;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="spinner mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-secondary-800">تذاكر الدعم</h1>
                <Link href="/support/new" className="btn btn-primary btn-sm">
                    <Plus className="w-4 h-4" />
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
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {getStatusIcon(ticket.status)}
                                        <span className="text-xs text-gray-400">#{ticket.ticketNumber}</span>
                                        {getPriorityBadge(ticket.priority)}
                                    </div>
                                    <h3 className="font-semibold text-secondary-800">{ticket.subject}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {getStatusLabel(ticket.status)} • {formatRelativeTime(ticket.createdAt)}
                                    </p>
                                </div>
                                <div className="text-gray-400">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
