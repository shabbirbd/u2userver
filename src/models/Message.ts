import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  text: string;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: String },
    senderId: { type: String },
    text: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", MessageSchema);