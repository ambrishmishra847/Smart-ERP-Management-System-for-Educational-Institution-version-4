import { io } from "socket.io-client";

let socket;

export const connectSocket = (userId) => {
  if (!socket) {
    socket = io((import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", ""));
  }

  socket.emit("join:user", userId);
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
