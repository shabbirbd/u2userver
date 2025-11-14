import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { connectDB } from "./src/config/db";
import Conversation from "./src/models/Conversation";
import Message from "./src/models/Message";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const onlineUsers = new Map<string, string>();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId: string) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on(
    "sendMessage",
    async ({
      senderId,
      receiverId,
      text,
    }: {
      senderId: string;
      receiverId: string;
      text: string;
    }) => {
      let conversation = await Conversation.findOne({
        members: { $all: [senderId, receiverId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          members: [senderId, receiverId],
        });
      }

      const newMessage = await Message.create({
        conversationId: conversation._id,
        senderId,
        text,
      });

      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", newMessage);
      }
    }
  );

  socket.on("disconnect", () => {
    [...onlineUsers].forEach(([userId, socketId]) => {
      if (socketId === socket.id) onlineUsers.delete(userId);
    });
  });
});

// Test route
app.get("/", (req, res) => res.send("Chat server running"));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));