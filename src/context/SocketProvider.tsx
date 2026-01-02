'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { socketConfig } from '@/lib/socketConfig';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export function useSocket() {
    return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketInstance = io({
            path: socketConfig.path,
            reconnection: socketConfig.reconnection,
            reconnectionDelay: socketConfig.reconnectionDelay,
            reconnectionDelayMax: socketConfig.reconnectionDelayMax,
            reconnectionAttempts: socketConfig.reconnectionAttempts,
        });

        socketInstance.on('connect', () => {
            console.log('[Socket.io] Connected:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('[Socket.io] Disconnected');
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('[Socket.io] Connection error:', error);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}
