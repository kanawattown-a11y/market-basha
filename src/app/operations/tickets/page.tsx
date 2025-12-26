'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Search,
    MessageCircle,
    User,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import { formatDateTime, translateTicketStatus, getTicketStatusColor } from '@/lib/utils';

interface Ticket {
    id: string;
    ticketNumber: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    user: { name: string; phone: string };
    assignedTo: { name: string } | null;
    messages: { id: string }[];
}

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(statusFilter && { status: statusFilter }),
            });

            const res = await fetch(`/api/tickets?${params}`);
            if (res.ok) {
                const data = await res.json();
                setTickets(data.tickets);
                setTotalPages(data.pagination?.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [page, statusFilter]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-secondary-800">إدارة التذاكر</h1>
                <p className="text-gray-500">عرض وإدارة تذاكر الدعم الفني</p>
            </div>

            <div className="card p-4">
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="input w-auto"
                >
                    <option value="">كل الحالات</option>
                    <option value="OPEN">مفتوحة</option>
                    <option value="IN_PROGRESS">قيد المعالجة</option>
                    <option value="RESOLVED">تم الحل</option>
                    <option value="CLOSED">مغلقة</option>
                </select>
            </div>

            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>رقم التذكرة</th>
                                <th>الموضوع</th>
                                <th>المستخدم</th>
                                <th>الحالة</th>
                                <th>المسند إليه</th>
                                <th>الرسائل</th>
                                <th>التاريخ</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8">
                                        <div className="spinner mx-auto"></div>
                                    </td>
                                </tr>
                            ) : tickets.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-gray-500">
                                        لا توجد تذاكر
                                    </td>
                                </tr>
                            ) : (
                                tickets.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td className="font-mono text-sm">#{ticket.ticketNumber}</td>
                                        <td className="font-medium text-secondary-800 max-w-xs truncate">
                                            {ticket.subject}
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                {ticket.user.name}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${getTicketStatusColor(ticket.status)}`}>
                                                {translateTicketStatus(ticket.status)}
                                            </span>
                                        </td>
                                        <td className="text-gray-500">
                                            {ticket.assignedTo?.name || '-'}
                                        </td>
                                        <td>
                                            <span className="flex items-center gap-1 text-gray-500">
                                                <MessageCircle className="w-4 h-4" />
                                                {ticket.messages?.length || 0}
                                            </span>
                                        </td>
                                        <td className="text-sm text-gray-500">{formatDateTime(ticket.createdAt)}</td>
                                        <td>
                                            <Link href={`/operations/tickets/${ticket.id}`} className="btn btn-ghost btn-sm">
                                                عرض
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-100">
                        <span className="text-sm text-gray-500">صفحة {page} من {totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="btn btn-sm bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="btn btn-sm bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
