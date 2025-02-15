import express from "express";
import { ChatLog } from "../models/ChatLog";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Start a new chat session
router.post("/start", async (req, res) => {
  try {
    const { userId } = req.body;
    const sessionId = uuidv4(); // Generate a new session ID
    res.status(201).json({ sessionId });
  } catch (error) {
    res.status(500).json({ error: "Failed to start a new session" });
  }
});

// Save a chat log for a session
router.post("/save", async (req, res) => {
  try {
    const { userId, sessionId, messages } = req.body;
    const chatLog = new ChatLog({ userId, sessionId, messages });
    await chatLog.save();
    res.status(201).json(chatLog);
  } catch (error) {
    res.status(500).json({ error: "Failed to save chat log" });
  }
});

// Get chat logs for a user
router.get("/:userId", async (req, res) => {
  try {
    const chatLogs = await ChatLog.find({ userId: req.params.userId });
    res.json(chatLogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve chat logs" });
  }
});

// Get chat logs for a specific session
router.get("/:userId/:sessionId", async (req, res) => {
  try {
    const { userId, sessionId } = req.params;
    const chatLogs = await ChatLog.find({ userId, sessionId });
    res.json(chatLogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve session chat logs" });
  }
});

export default router;
