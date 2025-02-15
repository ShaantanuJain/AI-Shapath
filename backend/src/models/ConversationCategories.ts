import { Document, Schema, model } from "mongoose";

// Define the TypeScript interface for a ConversationCategory document
interface IConversationCategory extends Document {
  name: string;
  description: string;
  prompt: string;
  redirectableToOtherCategory: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create the schema using the interface for stronger typing
const conversationCategorySchema = new Schema<IConversationCategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    redirectableToOtherCategory: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  },
);

export const ConversationCategory = model<IConversationCategory>(
  "ConversationCategory",
  conversationCategorySchema,
);
