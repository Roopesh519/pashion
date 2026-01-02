// Socket.io event types
export const SocketEvents = {
    // Product events
    PRODUCT_CREATED: 'product:created',
    PRODUCT_UPDATED: 'product:updated',
    PRODUCT_DELETED: 'product:deleted',
    PRODUCT_STOCK_UPDATED: 'product:stock:updated',
    LOW_STOCK_ALERT: 'product:low:stock',

    // Order events
    ORDER_CREATED: 'order:created',
    ORDER_STATUS_UPDATED: 'order:status:updated',

    // Connection events
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    JOIN_ADMIN: 'join-admin',
    LEAVE_ADMIN: 'leave-admin',
} as const;

// Low stock threshold
export const LOW_STOCK_THRESHOLD = 10;

// Socket.io configuration
export const socketConfig = {
    path: '/socket.io',
    addTrailingSlash: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
};
