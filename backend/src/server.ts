import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import chatRoutes from "./routes/chat.route";
import authRoutes from "./routes/auth.route";
import conversationCategoriesRoute from "./routes/conversationCategories.route";
import geminiChatRoute from "./routes/gemini.route";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(
  process.env.MONGO_URI as string,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions,
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

// Define a test route
app.get("/", (req, res) => {
  res.send("Mental Health Chatbot API is running...");
});
app.use("/api/categories", conversationCategoriesRoute);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/gemini", geminiChatRoute);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
