process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});


process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server);
io.on("connection", (socket) => {
    console.log("User connected");


    socket.on("draw", (data) => {
        try {
            socket.broadcast.emit("draw", data);
        } catch (err) {
            console.error("Error in draw event:", err);
        }
    });


    socket.on("clear", () => {
        try {
            socket.broadcast.emit("clear");
        } catch (err) {
            console.error("Error in clear event:", err);
        }
    });


    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});