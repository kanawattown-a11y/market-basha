'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    ChevronLeft,
    Send,
    User,
    Clock,
    Check
} from 'lucide-react';
import { formatDateTime, translateTicketStatus, getTicketStatusColor } from '@/lib/utils';

interface Message {
    id: string;
    content: string;
    isStaff: boolean;
    createdAt: string;
    user: { name: string };
}

interface TicketDetail {
    id: string;
    ticketNumber: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    user: { name: string; phone: string };
    assignedTo: { name: string } | null;
    messages: Message[];
}

export default function AdminTicketDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [ticket, setTicket] = useState<TicketDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [updating, setUpdating] = useState(false);

    const fetchTicket = async () => {
        if (!id) return;
        try {
            const res = await fetch(`/api/tickets/${id}`);
            if (res.ok) {
                const data = await res.json();
                setTicket(data.ticket);
            }
        } catch (error) {
            console.error('Error fetching ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSending(true);
        try {
            await fetch(`/api/tickets/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: message }),
            });
            setMessage('');
            fetchTicket();
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const updateStatus = async (status: string) => {
        setUpdating(true);
        try {
            await fetch(`/api/tickets/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            fetchTicket();
        } catch (error) {
            console.error('Error updating ticket:', error);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="spinner mx-auto"></div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">التذكرة غير موجودة</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/operations/tickets" className="text-gray-400 hover:text-gray-600">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-secondary-800">{ticket.subject}</h1>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">#{ticket.ticketNumber}</span>
                            <span className={`badge ${getTicketStatusColor(ticket.status)}`}>
                                {translateTicketStatus(ticket.status)}
                            </span>
                        </div>
                    </div>
                </div>
                <select
                    value={ticket.status}
                    onChange={(e) => updateStatus(e.target.value)}
                    className="input w-auto"
                    disabled={updating}
                >
                    <option value="OPEN">مفتوحة</option>
                    <option value="IN_PROGRESS">قيد المعالجة</option>
                    <option value="RESOLVED">تم الحل</option>
                    <option value="CLOSED">مغلقة</option>
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* Messages */}
                    <div className="card p-4 space-y-4 max-h-[500px] overflow-y-auto">
                        {ticket.messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`p-4 rounded-xl ${msg.isStaff
                                    ? 'bg-primary/10 mr-8'
                                    : 'bg-gray-100 ml-8'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-sm font-medium ${msg.isStaff ? 'text-primary' : 'text-secondary-800'}`}>
                                        {msg.user.name} {msg.isStaff && '(الدعم)'}
                                    </span>
                                    <span className="text-xs text-gray-400">{formatDateTime(msg.createdAt)}</span>
                                </div>
                                <p className="text-gray-700">{msg.content}</p>
                            </div>
                        ))}
                    </div>

                    {/* Reply */}
                    {ticket.status !== 'CLOSED' && (
                        <form onSubmit={sendMessage} className="card p-4">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="اكتب ردك..."
                                className="input min-h-24 mb-3"
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateStatus('RESOLVED')}
                                    disabled={updating}
                                    className="btn btn-outline"
                                >
                                    <Check className="w-4 h-4" />
                                    تم الحل
                                </button>
                                <button
                                    type="submit"
                                    disabled={sending || !message.trim()}
                                    className="btn btn-primary"
                                >
                                    {sending ? <div className="spinner"></div> : <><Send className="w-4 h-4" /> إرسال</>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Info */}
                <div className="space-y-4">
                    <div className="card p-4">
                        <h3 className="font-bold text-secondary-800 mb-3">معلومات العميل</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span>{ticket.user.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>{formatDateTime(ticket.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card p-4">
                        <h3 className="font-bold text-secondary-800 mb-3">الأولوية</h3>
                        <select className="input" defaultValue={ticket.priority}>
                            <option value="LOW">منخفضة</option>
                            <option value="NORMAL">عادية</option>
                            <option value="HIGH">عالية</option>
                            <option value="URGENT">عاجلة</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
