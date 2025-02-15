import mongoose, { Document } from "mongoose";

// Define an interface for individual messages
export interface IMessage {
  role: string; // 'user' or 'bot'
  content: string;
  timestamp?: Date;
}

// Define interface for ChatLog document
export interface IChatLog extends Document {
  userId: string;
  sessionId: string;
  messages: IMessage[];
  createdAt: Date;
}

const chatLogSchema = new mongoose.Schema<IChatLog>({
  userId: {
    type: String,
    required: true,
  },
  sessionId: {
    type: String,
    required: true, // Unique session identifier
  },
  messages: [
    {
      role: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// You can add model-level middleware or instance methods here if needed

export const ChatLog = mongoose.model<IChatLog>("ChatLog", chatLogSchema);
