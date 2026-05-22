import { Router } from "express";
import Conversation from "../models/Conversation";
import generateRandomColorPair from "../utils/colorUtils";

const router = Router();

/**
 * 🟦 GET ALL conversations for a user
 */
router.get("/conversations/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const conversations = await Conversation.find({
            "members.id": userId
        }).sort({ updatedAt: -1 });

        res.json(conversations);
    } catch (error) {
        console.error("Get Conversations Error:", error);
        res.status(500).json({ error: "Failed to get conversations" });
    }
});

/**
 * 🟦 GET one conversation (full object including messages)
 */
router.get("/conversation/:id", async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id);

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        res.json(conversation);
    } catch (error) {
        console.error("Get Conversation Error:", error);
        res.status(500).json({ error: "Failed to get conversation" });
    }
});

/**
 * 🟦 CREATE (or RETURN EXISTING) conversation between 2 users
 * Used when user opens a chat for the first time
*/
router.post("/conversation/start", async (req, res) => {
    try {
        const { sender, receiver, creator, message } = req.body;

        let conversation = await Conversation.findOne({
            isGroup: false,
            members: {
                $all: [
                    { $elemMatch: { id: sender.id } },
                    { $elemMatch: { id: receiver.id } }
                ]
            }
        });

        if (!conversation) {
            const newColors = generateRandomColorPair();
            let messages:any[] = message?.senderId?.length > 0 ? [message] : [];
            conversation = await Conversation.create({
                members: [sender, receiver],
                messages: messages,
                isGroup: false,
                colors: newColors,
                creator: creator
            }); 
        }

        res.json(conversation);
    } catch (error) {
        console.error("Start Conversation Error:", error);
        res.status(500).json({ error: "Failed to start conversation" });
    }
});

/**
 * 🟦 SEND MESSAGE to conversation
*/
router.post("/conversation/:id/message", async (req, res) => {
    try {
        const { senderId, text, media } = req.body;

        const message = {
            senderId,
            text,
            media,
            time: new Date().toISOString(),
            seenBy: [senderId]
        };

        const updated = await Conversation.findByIdAndUpdate(
            req.params.id,
            {
                $push: { messages: message }, 
                $set: { updatedAt: new Date() }
            },
            { new: true }
        );

        res.json(updated);
    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({ error: "Failed to send message" });
    }
});

/**
 * 🟦 CREATE GROUP conversation
 */
router.post("/conversation/group", async (req, res) => {
    try {
        const { members, message, creator } = req.body;
        // members: Member[]
        const newColors = generateRandomColorPair();
        let messages:any[] = message?.senderId?.length > 0 ? [message] : [];
        const conversation = await Conversation.create({
            members,
            isGroup: true,
            messages: messages,
            colors: newColors,
            creator: creator
        });
        res.json(conversation);
    } catch (error) {
        console.error("Create Group Error:", error);
        res.status(500).json({ error: "Failed to create group" });
    }
});

/**
 * 🟦 MARK messages as seen
 */
router.post("/conversation/:id/seen", async (req, res) => {
    try {
        const { userId } = req.body;

        const updated = await Conversation.updateOne(
            { _id: req.params.id },
            {
                $addToSet: { "messages.$[].seenBy": userId }
            }
        );

        res.json({ success: true });
    } catch (error) {
        console.error("Seen Error:", error);
        res.status(500).json({ error: "Failed to update seen status" });
    }
});


// update group members
router.post("/conversation/updateMembers", async (req, res) => {
    try {
        const { updatedConv } = req.body;

        // Use findOneAndUpdate to get the actual document back
        const conversation = await Conversation.findOneAndUpdate(
            { _id: updatedConv._id },
            { $set: updatedConv },
            { new: true } // This returns the updated document, not the old one
        );

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        res.json(conversation); // Now returns the full DMConversation object
    } catch (error) {
        console.error("Update Members Error:", error);
        res.status(500).json({ error: "Failed to update conversation" });
    }
});
// update group members

// delete conversation
router.delete("/conversation/delete", async (req, res) => {
    try {
        const { convId } = req.body;

        const updated = await Conversation.deleteOne(
            { _id: convId }
        );

        res.json(updated);
    } catch (error) {
        console.error("Seen Error:", error);
        res.status(500).json({ error: "Failed to delete" });
    }
});
// delete conversation

export default router;
