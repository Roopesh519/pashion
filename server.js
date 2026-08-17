const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { getToken } = require('next-auth/jwt');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling request:', err);
            res.statusCode = 500;
            res.end('Internal server error');
        }
    });

    // Initialize Socket.io
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
        },
    });

    // Make io accessible to API routes
    global.io = io;

    io.use(async (socket, next) => {
        try {
            const isProduction = process.env.NODE_ENV === 'production';
            const token = await getToken({
                req: socket.request,
                secret: process.env.NEXTAUTH_SECRET,
                secureCookie: isProduction,
                cookieName: isProduction ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
            });

            if (!token?.id) return next(new Error('Authentication required'));
            socket.data.user = { id: token.id, role: token.role };
            next();
        } catch (error) {
            next(new Error('Authentication required'));
        }
    });

    // Socket.io connection handling
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        if (socket.data.user.role === 'admin') socket.join('admin');

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });

    });

    httpServer
        .once('error', (err) => {
            console.error('Server error:', err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
            console.log(`> Socket.io server is running`);
        });
});
