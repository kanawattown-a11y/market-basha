'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Ticket,
    MessageCircle,
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { formatRelativeTime, translateTicketStatus, getTicketStatusColor } from '@/lib/utils';

interface TicketItem {
    id: string;
    ticketNumber: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    messages: { id: string }[];
}

export default function SupportPage() {
    const [tickets, setTickets] = useState<TicketItem[]>([]);
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

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'HIGH':
            case 'URGENT':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                <span className="text-secondary font-bold text-xl">م</span>
                            </div>
                            <span className="font-bold text-secondary-800">ماركت باشا</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 max-w-3xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary-800">الدعم</h1>
                        <p className="text-gray-500">تذاكر الدعم الفني</p>
                    </div>
                    <Link href="/support/new" className="btn btn-primary">
                        <Plus className="w-5 h-5" />
                        تذكرة جديدة
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="spinner mx-auto"></div>
                    </div>
                ) : tickets.length === 0 ? (
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
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {getPriorityIcon(ticket.priority)}
                                            <span className="text-xs text-gray-400">#{ticket.ticketNumber}</span>
                                        </div>
                                        <h3 className="font-semibold text-secondary-800">{ticket.subject}</h3>
                                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <MessageCircle className="w-4 h-4" />
                                                {ticket.messages?.length || 0} رسائل
                                            </span>
                                            <span>{formatRelativeTime(ticket.createdAt)}</span>
                                        </div>
                                    </div>
                                    <span className={`badge ${getTicketStatusColor(ticket.status)}`}>
                                        {translateTicketStatus(ticket.status)}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
