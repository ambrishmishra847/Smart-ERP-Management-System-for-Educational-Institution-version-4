import { Server } from "socket.io";

let ioInstance = null;

export const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  ioInstance.on("connection", (socket) => {
    socket.on("join:user", (userId) => {
      socket.join(`user:${userId}`);
    });

    socket.on("disconnect", () => {});
  });

  return ioInstance;
};

export const getIO = () => ioInstance;
