import fastify, { FastifyInstance } from "fastify";
import { Server } from "socket.io";

const port = process.env.PORT ? parseInt(process.env.PORT) : 4000;

const server: FastifyInstance = fastify();


const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
};

const io = new Server(server.server, {
  cors: corsOptions,
});

const rooms = new Map<string, Set<string>>();

// username 
const socketUsers = new Map<string, string>();

io.on("connection", (socket) => {
  console.log(`[Socket.io] Un client est connecté : ${socket.id}`);

  //rejoindre la room
  socket.on("join-room", (roomId: string) => {
    socket.join(roomId);
    console.log(`Client ${socket.id} a rejoint la salle : ${roomId}`);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId)!.add(socket.id);

    const userCount = rooms.get(roomId)!.size;
    console.log(`Room ${roomId} a maintenant ${userCount} utilisateur(s)`);

    io.to(roomId).emit("room-count", {
      type: "ROOM_COUNT",
      count: userCount,
    });
  });

  socket.on("user-joined", (data: { roomId: string; userName: string }) => {
    const { roomId, userName } = data;

    console.log(`${userName} a rejoint la room ${roomId}`);
    socketUsers.set(socket.id, userName);

    socket.to(roomId).emit("user-joined", {
      userName,
    });
  });

  socket.on("action-client", (data: { roomId: string; payload: any }) => {
    const { roomId, payload } = data;
    socket.to(roomId).emit("update-client", payload);
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client déconnecté : ${socket.id}`);

    socketUsers.delete(socket.id);

    rooms.forEach((users, roomId) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        const userCount = users.size;
        
        console.log(`Room ${roomId} a maintenant ${userCount} utilisateur(s) après déconnexion`);

        if (userCount > 0) {
          io.to(roomId).emit("room-count", {
            type: "ROOM_COUNT",
            count: userCount,
          });
        } else {
          rooms.delete(roomId);
          console.log(`Room ${roomId} supprimée (vide)`);
        }
      }
    });
  });
});

server.get("/", async () => {
  return {
    status: "Socket Server is UP!",
    framework: "Fastify",
    time: new Date().toISOString(),
  };
});

const start = async () => {
  try {
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`Socket Server écoutant sur http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();