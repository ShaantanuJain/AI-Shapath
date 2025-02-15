import mongoose from "mongoose";

const chatLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sessionId: { type: String, required: true }, // Unique session ID
  messages: [
    {
      role: { type: String, required: true }, // 'user' or 'bot'
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export const ChatLog = mongoose.model("ChatLog", chatLogSchema);
