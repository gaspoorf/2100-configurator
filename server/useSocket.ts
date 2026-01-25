import { io, Socket } from "socket.io-client";


const SOCKET_URL: string = "http://172.20.10.4:4000"; 

let socket: Socket | null = null;
const isConnected: Ref<boolean> = ref(false);

interface ActionPayload {
  type: string;
  [key: string]: any; 
}

export function useSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
    });

    socket.on("connect", () => {
      isConnected.value = true;
      console.log("Client Socket.io connecté (Nuxt).");
    });

    socket.on("disconnect", () => {
      isConnected.value = false;
      console.log("Client Socket.io déconnecté (Nuxt).");
    });
  }


  const connect = () => {
    if (socket && !isConnected.value) {
      socket.connect();
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
    }
  };

  const joinRoom = (roomId: string) => {
    if (socket && isConnected.value) {
      socket.emit("join-room", roomId);
    }
  };

  const sendAction = (roomId: string, payload: ActionPayload) => {
    if (socket && isConnected.value) {
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
    isConnected,
    connect,
    disconnect,
    joinRoom,
    sendAction,
    on,
    off,
  };
}
