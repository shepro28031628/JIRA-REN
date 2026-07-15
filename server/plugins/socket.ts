import { Server as SocketServer } from 'socket.io';
import { defineNitroPlugin } from 'nitropack/runtime/plugin';

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const req = event.node.req;
    const server = (req.socket as any)?.server;

    if (server && !globalThis.io) {
      const io = new SocketServer(server, {
        path: '/api/socket.io',
        cors: {
          origin: '*',
        }
      });

      io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('issue:moved', (data) => {
          socket.broadcast.emit('issue:moved', data);
        });

        socket.on('issue:created', (data) => {
          socket.broadcast.emit('issue:created', data);
        });

        socket.on('issue:updated', (data) => {
          socket.broadcast.emit('issue:updated', data);
        });

        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id);
        });
      });

      globalThis.io = io;
      console.log('Socket.io server initialized');
    }
  });
});

declare global {
  var io: SocketServer | undefined;
}
