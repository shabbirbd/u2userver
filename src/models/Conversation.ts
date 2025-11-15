import mongoose, { Schema, Document } from "mongoose";

interface Member {
  id: string;
  name?: string;
  email: string;
  image?: string;
}

interface Media {
  type: string;
  url: string;
}

interface Message {
  senderId: string;
  text: string;
  media?: Media;
  time: string;
  seenBy: string[];
}

export interface IConversation extends Document {
  members: Member[];
  messages: Message[];
  isGroup: boolean;
  groupName?: string;
  groupImage?: string;
  colors?: { dark: string; light: string}
}

const MemberSchema = new Schema<Member>({
  id: { type: String, required: true },
  name: String,
  email: { type: String, required: true },
  image: String,
});

const MediaSchema = new Schema<Media>({
  type: String,
  url: String,
});

const MessageSchema = new Schema<Message>({
  senderId: { type: String, required: true },
  text: String,
  media: MediaSchema,
  time: { type: String, required: true },
  seenBy: { type: [String], default: [] },
});

const ConversationSchema = new Schema<IConversation>({
  members: { type: [MemberSchema], required: true },
  messages: { type: [MessageSchema], default: [] },
  isGroup: { type: Boolean, default: false },
  groupName: String,
  groupImage: String,
  colors: {type: Object, default: {dare: '#3d5f8f', light: '#9ec5fa'}}
}, {
    timestamps: true
});

export default mongoose.model<IConversation>("Conversation", ConversationSchema);