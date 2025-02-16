import { Document, Model, Schema, model } from "mongoose";
import { IConversationCategory } from "./ConversationCategories";

export interface ISession extends Document {
  userId: Schema.Types.ObjectId; // Reference to a User
  conversation: IConversationCategory; // Reference to a Conversation Category
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
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "ConversationCategory", // Adjust accordingly if needed
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

// Middleware to auto-populate the conversation field for any find queries
sessionSchema.pre(/^find/, function (next) {
  (this as any).populate("conversation");
  next();
});
// Note: If you use findOneAndUpdate or similar operations that are not covered by /^find/,
// consider adding similar pre-hooks for them as needed.

export const Session = model<ISession>("Session", sessionSchema);
