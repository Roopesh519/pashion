import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseGlobal {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: MongooseGlobal; // eslint-disable-line no-var
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
        console.log('MongoDB Connected Successfully');
    } catch (e: any) {
        cached.promise = null;

        // Friendly diagnostics for common errors
        const maskUri = (uri: string) => {
            try {
                return uri.replace(/(mongodb(?:\+srv)?:\/\/)(.*@)/, '$1***@');
            } catch {
                return '***masked***';
            }
        };

        const extractHost = (uri?: string) => {
            if (!uri) return 'unknown-host';
            try {
                const m = uri.match(/@([^/\?]+)/);
                if (m && m[1]) return m[1];
                const noProto = uri.replace(/^[^:]+:\/\//, '');
                return noProto.split(/[\/?]/)[0] || 'unknown-host';
            } catch {
                return 'unknown-host';
            }
        };

        const host = extractHost(MONGODB_URI);
        const msg = e?.message || '';

        if (msg.includes('ENOTFOUND') || msg.includes('getaddrinfo ENOTFOUND') || msg.includes('querySrv') || msg.includes('ENETUNREACH')) {
            console.error(`MongoDB connection error: DNS lookup failed for host '${host}'. Please verify your MONGODB_URI and network settings. (masked URI: ${maskUri(MONGODB_URI || '')})`);
        } else if (msg.includes('bad auth') || msg.includes('Authentication failed')) {
            console.error(`MongoDB authentication failed for user. Please verify your username and password in MONGODB_URI. (masked URI: ${maskUri(MONGODB_URI || '')})`);
        } else if (msg.includes('TLS') || msg.includes('SSL') || msg.includes('tls') || msg.includes('certificate')) {
            console.error(`MongoDB TLS/SSL error connecting to host '${host}'. Check your network and MongoDB Atlas firewall settings. (masked URI: ${maskUri(MONGODB_URI || '')})`);
        } else {
            console.error('MongoDB connection error:', e);
        }

        throw e;
    }

    return cached.conn;
}

export default dbConnect;
