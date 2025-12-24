'use client';

import { useState, useEffect } from 'react';
import { Ticket, Clock, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';

interface TicketItem {
    id: string;
    ticketNumber: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    user: { name: string };
    _count: { messages: number };
}

export default function OperationsTicketsPage() {
    const [tickets, setTickets] = useState<TicketItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await fetch('/api/tickets?status=OPEN,IN_PROGRESS');
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
            default: return <Ticket className="w-4 h-4 text-gray-400" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'bg-red-100 text-red-700';
            case 'HIGH': return 'bg-orange-100 text-orange-700';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-600';
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
            <div>
                <h1 className="text-2xl font-bold text-secondary-800">تذاكر الدعم</h1>
                <p className="text-gray-500">التذاكر المفتوحة وقيد المعالجة</p>
            </div>

            {tickets.length === 0 ? (
                <div className="card p-12 text-center">
                    <Ticket className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">لا توجد تذاكر مفتوحة</p>
                </div>
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>التذكرة</th>
                                    <th>المستخدم</th>
                                    <th>الأولوية</th>
                                    <th>الحالة</th>
                                    <th>الرسائل</th>
                                    <th>التاريخ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td>
                                            <Link href={`/operations/tickets/${ticket.id}`} className="hover:text-primary">
                                                <span className="font-mono text-xs text-gray-400">#{ticket.ticketNumber}</span>
                                                <p className="font-medium text-secondary-800">{ticket.subject}</p>
                                            </Link>
                                        </td>
                                        <td className="text-gray-600">{ticket.user.name}</td>
                                        <td>
                                            <span className={`badge text-xs ${getPriorityColor(ticket.priority)}`}>
                                                {ticket.priority === 'URGENT' ? 'عاجل' :
                                                    ticket.priority === 'HIGH' ? 'عالي' :
                                                        ticket.priority === 'MEDIUM' ? 'متوسط' : 'منخفض'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                {getStatusIcon(ticket.status)}
                                                <span className="text-sm">
                                                    {ticket.status === 'OPEN' ? 'مفتوحة' : 'قيد المعالجة'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{ticket._count.messages}</td>
                                        <td className="text-sm text-gray-400">{formatRelativeTime(ticket.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
