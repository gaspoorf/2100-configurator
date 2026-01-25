import { io, Socket } from "socket.io-client";

const SOCKET_URL: string = "http://172.20.10.4:4000/";


let socket: Socket | null = null;

interface ActionPayload {
  type: string;
  [key: string]: any;
}

export function useSocket() {
  const webSocketStore = useWebSocket();
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
    });

    socket.on("connect", () => {
      webSocketStore.isConnected = true;
      console.log("Client Socket.io connecté (Nuxt).");
    });

    socket.on("disconnect", () => {
      webSocketStore.isConnected = false;
      console.log("Client Socket.io déconnecté (Nuxt).");
    });
  }


  const connect = () => {
    if (socket && !webSocketStore.isConnected) {
      socket.connect();
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
    }
  };

  const joinRoom = (roomId: string) => {
    if (socket && webSocketStore.isConnected) {
      socket.emit("join-room", roomId);
    }
  };

  const sendAction = (roomId: string, payload: ActionPayload) => {
    if (socket && webSocketStore.isConnected) {
      socket.emit("action-client", { roomId, payload });
    }
  };

  const on = (eventName: string, callback: (payload: any) => void) => {
    if (socket) {
      socket.on(eventName, callback);
    }
  };

  const off = (eventName: string, callback: (payload: any) => void) => {
    if (socket) {
      socket.off(eventName, callback);
    }
  };

  return {
    socket,
    connect,
    disconnect,
    joinRoom,
    sendAction,
    on,
    off,
  };
}
