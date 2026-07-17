import { onUnmounted, ref } from 'vue';

let globalSocket: any = null;

export const useSocket = () => {
  const isConnected = ref(false);

  const initSocket = async () => {
    if (process.client && !globalSocket) {
      const { io } = await import('socket.io-client');
      globalSocket = io({
        path: '/api/socket.io',
      });

      globalSocket.on('connect', () => {
        isConnected.value = true;
      });

      globalSocket.on('disconnect', () => {
        isConnected.value = false;
      });
    }
  };

  const emitEvent = (eventName: string, data: any) => {
    if (globalSocket) {
      globalSocket.emit(eventName, data);
    }
  };

  const listenEvent = (eventName: string, callback: (data: any) => void) => {
    if (globalSocket) {
      globalSocket.on(eventName, callback);
    }
  };

  const removeListener = (eventName: string, callback: (data: any) => void) => {
    if (globalSocket) {
      globalSocket.off(eventName, callback);
    }
  };

  return {
    initSocket,
    emitEvent,
    listenEvent,
    removeListener,
    isConnected
  };
};
