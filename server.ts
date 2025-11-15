import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { connectDB } from "./src/config/db";
import Conversation from "./src/models/Conversation";
import conversationRoutes from "./src/routes/conversationRoutes";

dotenv.config();
connectDB();

const allowedOrigins = [
    "http://localhost:3000",
    "https://samedays.vercel.app",
    "https://u2userver.onrender.com"
];

const app = express();
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);
app.use(express.json());
app.use(conversationRoutes);



const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
    },
});


// Track online users
const onlineUsers = new Map<string, string>();

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId: string) => {
        onlineUsers.set(userId, socket.id);
    });

    /**
     * SEND MESSAGE
     * Handles:
     * - 1-to-1
     * - group chat
     */
    socket.on(
        "sendMessage",
        async ({
            conversationId,
            members,
            senderId,
            text,
            media,
        }: {
            conversationId?: string;
            members: any[];
            senderId: string;
            text: string;
            media?: { type: string; url: string };
        }) => {
            let conversation;

            // === Create new conversation if not exists ===
            if (!conversationId) {
                conversation = await Conversation.create({
                    members: members,
                    messages: [],
                    isGroup: members.length > 2,
                });
            } else {
                conversation = await Conversation.findById(conversationId);
            }

            if (!conversation) return;

            const newMessage = {
                senderId,
                text,
                media,
                time: new Date().toISOString(),
                seenBy: [senderId], // sender has seen the message
            };

            conversation.messages.push(newMessage);
            await conversation.save();

            // Notify all members
            conversation.members.forEach((m) => {
                const socketId = onlineUsers.get(m.id);
                if (socketId) {
                    io.to(socketId).emit("receiveMessage", {
                        conversationId: conversation._id,
                        message: newMessage,
                    });
                }
            });
        }
    );

    /**
     * MARK MESSAGE AS SEEN
     */
    socket.on(
        "seen",
        async ({
            conversationId,
            userId,
        }: {
            conversationId: string;
            userId: string;
        }) => {
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) return;

            // Add seen to all latest messages not seen before
            conversation.messages.forEach((msg) => {
                if (!msg.seenBy.includes(userId)) msg.seenBy.push(userId);
            });

            await conversation.save();

            // notify all users in conversation
            conversation.members.forEach((m) => {
                const socketId = onlineUsers.get(m.id);
                if (socketId) {
                    io.to(socketId).emit("messageSeenUpdate", {
                        conversationId,
                        seenBy: userId,
                    });
                }
            });
        }
    );

    socket.on("disconnect", () => {
        [...onlineUsers].forEach(([userId, socketId]) => {
            if (socketId === socket.id) onlineUsers.delete(userId);
        });
    });
});

// API test route
app.get("/", (req, res) => res.send("Chat server updated ✔"));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
);