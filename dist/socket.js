"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const socket = (server) => {
    const io = new socket_io_1.Server(server, {
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
exports.default = socket;
//# sourceMappingURL=socket.js.map