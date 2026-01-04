'use client';

import { useEffect, useState, useCallback } from 'react';

interface UseSocketOptions {
    room?: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

// Fallback when Socket.IO is not available
const noop = () => () => { };

export function useSocket(options: UseSocketOptions = {}) {
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState<any>(null);

    useEffect(() => {
        // Try to dynamically import socket.io-client
        const initSocket = async () => {
            try {
                const { io } = await import('socket.io-client');

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

                return () => {
                    socketInstance.disconnect();
                };
            } catch (error) {
                // Socket.IO not installed - fail silently, no auto-refresh
                console.log('Socket.IO not available, running in offline mode');
                setIsConnected(false);
            }
        };

        initSocket();
    }, [options.room]);

    const on = useCallback((event: string, handler: (...args: any[]) => void) => {
        if (socket) {
            socket.on(event, handler);
            return () => socket.off(event, handler);
        }
        return noop; // Return empty function when socket not available
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
