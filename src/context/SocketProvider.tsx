'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
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
    const { status } = useSession();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (status !== 'authenticated') {
            setSocket(null);
            setIsConnected(false);
            return;
        }
        const socketInstance = io({
            path: socketConfig.path,
            reconnection: socketConfig.reconnection,
            reconnectionDelay: socketConfig.reconnectionDelay,
            reconnectionDelayMax: socketConfig.reconnectionDelayMax,
            reconnectionAttempts: socketConfig.reconnectionAttempts,
        });

        socketInstance.on('connect', () => {
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
        });

        socketInstance.on('connect_error', () => {
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.close();
        };
    }, [status]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}
