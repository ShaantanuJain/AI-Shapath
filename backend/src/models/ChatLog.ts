import mongoose, { Document, Schema } from "mongoose";
import { ISession } from "./Session";

export interface IMessage {
  role: string; // e.g. 'user' or 'model'
  content: string;
  timestamp?: Date;
}

export interface IChatLog extends Document {
  userId: string;
  session: Schema.Types.ObjectId | ISession; // Reference to a Session document
  messages: IMessage[];
  createdAt: Date;
}

const chatLogSchema = new mongoose.Schema<IChatLog>({
  userId: {
    type: String,
    required: true,
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true,
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

export const ChatLog = mongoose.model<IChatLog>("ChatLog", chatLogSchema);
