'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    ChevronLeft,
    Send,
    MessageCircle,
    Clock
} from 'lucide-react';
import { formatRelativeTime, translateTicketStatus, getTicketStatusColor } from '@/lib/utils';

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
    messages: Message[];
}

export default function TicketDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [ticket, setTicket] = useState<TicketDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

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
            const res = await fetch(`/api/tickets/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: message }),
            });
            if (res.ok) {
                setMessage('');
                fetchTicket();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">التذكرة غير موجودة</p>
                    <Link href="/support" className="btn btn-primary mt-4">
                        العودة للدعم
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 max-w-2xl">
                    <div className="flex items-center gap-4">
                        <Link href="/support" className="text-gray-400 hover:text-gray-600">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="font-bold text-secondary-800">{ticket.subject}</h1>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400">#{ticket.ticketNumber}</span>
                                <span className={`badge text-xs ${getTicketStatusColor(ticket.status)}`}>
                                    {translateTicketStatus(ticket.status)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <main className="flex-1 container mx-auto px-4 py-4 max-w-2xl overflow-y-auto">
                <div className="space-y-4">
                    {ticket.messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.isStaff ? 'justify-start' : 'justify-end'}`}
                        >
                            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.isStaff
                                ? 'bg-white border border-gray-200 rounded-br-none'
                                : 'bg-primary text-secondary rounded-bl-none'
                                }`}>
                                <p className={`text-sm font-medium mb-1 ${msg.isStaff ? 'text-primary' : 'text-secondary-800'}`}>
                                    {msg.user.name}
                                </p>
                                <p className={msg.isStaff ? 'text-gray-700' : 'text-secondary-800'}>
                                    {msg.content}
                                </p>
                                <p className={`text-xs mt-2 ${msg.isStaff ? 'text-gray-400' : 'text-secondary-700'}`}>
                                    {formatRelativeTime(msg.createdAt)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Input */}
            {ticket.status !== 'CLOSED' && (
                <div className="bg-white border-t border-gray-200 p-4">
                    <form onSubmit={sendMessage} className="container mx-auto max-w-2xl flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="اكتب رسالتك..."
                            className="input flex-1"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={sending || !message.trim()}
                            className="btn btn-primary px-4"
                        >
                            {sending ? <div className="spinner"></div> : <Send className="w-5 h-5" />}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
