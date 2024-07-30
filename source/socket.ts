import { Server as SocketIOServer } from "socket.io";
import { UserModel } from "./models/user.model";

const socket = (server: any) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Adjust the origin to match your frontend... or use "*" to allow all origins
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Event listener for messages from clients
    socket.on("message", (data) => {
      console.log("Message received:", data);
      // Broadcast message to all clients
      io.emit("message", data);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  server.listen(9002, () => {
    console.log("Socket.IO start listening to port: 9002");
  });

  return io;
};

export default socket;
