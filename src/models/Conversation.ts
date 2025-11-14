import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  members: string[];
}

const ConversationSchema = new Schema<IConversation>(
  {
    members: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IConversation>("Conversation", ConversationSchema);