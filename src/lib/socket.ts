import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

// Get the global io instance
export function getIO(): SocketIOServer | null {
    if (typeof global !== 'undefined' && (global as any).io) {
        return (global as any).io;
    }
    return io;
}

// Broadcast order events
export function broadcastOrderEvent(event: string, data: any) {
    const ioInstance = getIO();
    if (ioInstance) {
        // Broadcast to admin and operations rooms
        ioInstance.to('admin').emit(event, data);
        ioInstance.to('operations').emit(event, data);
        console.log(`Broadcasted ${event} to admin and operations`);
    } else {
        console.warn('Socket.IO not initialized');
    }
}

// Broadcast to specific user
export function emitToUser(userId: string, event: string, data: any) {
    const ioInstance = getIO();
    if (ioInstance) {
        ioInstance.to(`user-${userId}`).emit(event, data);
        console.log(`Emitted ${event} to user ${userId}`);
    }
}

// Broadcast to driver
export function emitToDriver(driverId: string, event: string, data: any) {
    const ioInstance = getIO();
    if (ioInstance) {
        ioInstance.to(`driver-${driverId}`).emit(event, data);
        console.log(`Emitted ${event} to driver ${driverId}`);
    }
}
