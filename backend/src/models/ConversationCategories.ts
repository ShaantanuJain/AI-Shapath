import { Document, Schema, model } from "mongoose";

// Define the TypeScript interface for a ConversationCategory document
export interface IConversationCategory extends Document {
  name: string;
  description: string;
  prompt: string;
  icon?: string; // e.g. "MessageCircle", "Brain", etc.
  imageUrl?: string;
  gradient: string; // ← new field for styling
  textColor: string; // ← new field for styling
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
    icon: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    gradient: {
      type: String,
      default: "",
    },
    textColor: {
      type: String,
      default: "",
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
