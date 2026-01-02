import { Server } from 'socket.io';
import { SocketEvents } from './socketConfig';

// Helper to get Socket.io instance from global
export function getSocketIO(): Server | null {
    // `global` is typed as `typeof globalThis` and doesn't have an index signature
    // in TypeScript. Cast to `any` when accessing runtime-injected fields.
    if (typeof global !== 'undefined' && (global as any).io) {
        return (global as any).io as Server;
    }
    return null;
}

// Emit event to all connected clients
export function emitToAll(event: string, data: any) {
    const io = getSocketIO();
    if (io) {
        io.emit(event, data);
        console.log(`[Socket.io] Emitted ${event}:`, data);
    }
}

// Emit event to admin room only
export function emitToAdmin(event: string, data: any) {
    const io = getSocketIO();
    if (io) {
        io.to('admin').emit(event, data);
        console.log(`[Socket.io] Emitted to admin ${event}:`, data);
    }
}

// Product event emitters
export function emitProductCreated(product: any) {
    emitToAdmin(SocketEvents.PRODUCT_CREATED, product);
}

export function emitProductUpdated(product: any) {
    emitToAll(SocketEvents.PRODUCT_UPDATED, product);
}

export function emitProductDeleted(productId: string) {
    emitToAdmin(SocketEvents.PRODUCT_DELETED, { productId });
}

export function emitProductStockUpdated(productId: string, stock: number) {
    emitToAll(SocketEvents.PRODUCT_STOCK_UPDATED, { productId, stock });
}

export function emitLowStockAlert(product: any) {
    emitToAdmin(SocketEvents.LOW_STOCK_ALERT, {
        productId: product._id || product.id,
        name: product.name,
        stock: product.stock,
    });
}

// Order event emitters
export function emitOrderCreated(order: any) {
    emitToAdmin(SocketEvents.ORDER_CREATED, order);
}

export function emitOrderStatusUpdated(orderId: string, status: string, order?: any) {
    emitToAll(SocketEvents.ORDER_STATUS_UPDATED, {
        orderId,
        status,
        order,
    });
}
