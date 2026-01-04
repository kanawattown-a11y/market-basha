'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
    room?: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

export function useSocket(options: UseSocketOptions = {}) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize socket connection
        const socketInstance = io({
            path: '/socket.io',
            transports: ['websocket', 'polling'],
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
            setIsConnected(true);

            // Join room if specified
            if (options.room) {
                socketInstance.emit('join-room', options.room);
            }

            options.onConnect?.();
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
            options.onDisconnect?.();
        });

        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            socketInstance.disconnect();
        };
    }, [options.room]);

    const on = useCallback((event: string, handler: (...args: any[]) => void) => {
        if (socket) {
            socket.on(event, handler);
            return () => socket.off(event, handler);
        }
    }, [socket]);

    const emit = useCallback((event: string, data: any) => {
        if (socket) {
            socket.emit(event, data);
        }
    }, [socket]);

    return {
        socket,
        isConnected,
        on,
        emit,
    };
}
