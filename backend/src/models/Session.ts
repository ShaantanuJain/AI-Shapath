import { Document, Schema, model } from "mongoose";

export interface ISession extends Document {
  userId: Schema.Types.ObjectId; // Reference to a User
  conversationId: Schema.Types.ObjectId; // Reference to a Conversation Category
  summary: string; // Summary of the conversation
  nMinusTenSummary: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "ConversationCategory", // Adjust the ref if conversationId refers to another model
      required: true,
    },
    summary: {
      type: String,
      trim: true,
    },
    nMinusTenSummary: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  },
);

export const Session = model<ISession>("Session", sessionSchema);
