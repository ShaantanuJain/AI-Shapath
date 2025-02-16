import express from "express";
import { ChatLog } from "../models/ChatLog";
import { Session } from "../models/Session";
import { chatResponse } from "../lib/gemini/chatResponse";
import { authenticateToken } from "../middleware/auth";
import { AuthRequest } from "../lib/types/middleware";
import { ConversationCategory } from "../models/ConversationCategories";

const router = express.Router();

// Apply authentication middleware to all routes in this file
router.use(authenticateToken);

/*
  POST /chat/message
  Sends a new message. It expects:
    { sessionId, userMessage }
  It retrieves (or creates if not exists) the chat log, adds the user’s message
  (using the authenticated user's ID), calls the AI, saves its response,
  and if a redirect is suggested by the AI, updates the session accordingly.
*/
router.post("/message", async (req: AuthRequest, res) => {
  try {
    const { sessionId, userMessage } = req.body;
    // Get userId from authenticated token (set by the middleware)
    const userId = req.user?.userId;
    if (!sessionId || !userMessage || !userId) {
      res
        .status(400)
        .json({ error: "Missing sessionId, userMessage, or authorization" });
      return;
    }

    // Find the chat log based on session and user. If it doesn't exist, create one including the userId.
    let chatLog = await ChatLog.findOne({ session: sessionId, userId });
    if (!chatLog) {
      chatLog = new ChatLog({ session: sessionId, userId, messages: [] });
      await chatLog.save();
    }

    // Locate the session document
    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    // Append the user message to the chat log
    chatLog.messages.push({ role: "user", content: userMessage });
    await chatLog.save();

    // Prepare the systemInstruction from the session’s conversation or default to a helpful assistant.
    const systemInstruction =
      // @ts-ignore
      (session.conversation && session.conversation.systemInstruction) ||
      "You are a helpful assistant.";
    const redirectPlaceholder = "";
    let aiResult: {
      message: string;
      redirectToOtherCategory?: string;
    };

    const topics = await ConversationCategory.find({});

    try {
      const llmResponse = await chatResponse(chatLog.messages, userMessage, {
        systemInstruction,
        redirectToOtherCategory:
          session.conversation.redirectableToOtherCategory,
        topics: topics.map((topic) => topic.name),
      });

      // Try parsing the JSON output from the AI
      const responseText =
        (llmResponse.response.candidates &&
          llmResponse.response.candidates[0].content.parts[0].text) ||
        JSON.stringify({});
      try {
        JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        throw new Error("Failed to parse JSON response");
      }
      aiResult = JSON.parse(responseText);
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ error: "Failed to process chat message" });
      return;
    }

    // Append the AI (model) response to the chat log
    const aiMessage = aiResult.message || "";
    chatLog.messages.push({ role: "model", content: aiMessage });
    await chatLog.save();

    // If the AI suggests a redirection, update the session accordingly.
    if (aiResult.redirectToOtherCategory) {
      // Here you might check that the new category exists before updating.
      // For example:
      // session.conversation = aiResult.redirectToOtherCategory;
      console.log("Redirecting to another category");
      // await session.save();
    }
    res.status(200).json({
      chatLog,
      session,
      redirectToOtherCategory: aiResult.redirectToOtherCategory || null,
    });
  } catch (error) {
    console.error("Error processing message:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

/*
  GET /chat/session/:sessionId
  Retrieves the chat log messages for a specific session.
  Only returns data if the chat log belongs to the authenticated user.
*/
router.get("/session/:sessionId", async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const chatLog = await ChatLog.findOne({
      session: sessionId,
      userId,
    }).populate("session");
    if (!chatLog) {
      res.status(404).json({ error: "Chat log not found" });
      return;
    }
    res.json(chatLog);
  } catch (error) {
    console.error("Error fetching session chat log:", error);
    res.status(500).json({ error: "Failed to retrieve session chat logs" });
  }
});

/*
  GET /chat/user/:userId
  Retrieves all chat logs for a specific user.
  For added security, the requested userId should match the authenticated token.
*/
router.get("/user/:userId", async (req: AuthRequest, res) => {
  try {
    const requestedUserId = req.params.userId;
    const authUserId = req.user?.userId;
    if (!authUserId || requestedUserId !== authUserId) {
      res.status(403).json({ error: "Not allowed to view these chat logs" });
      return;
    }
    const chatLogs = await ChatLog.find({ userId: requestedUserId }).populate(
      "session",
    );
    res.json(chatLogs);
  } catch (error) {
    console.error("Error fetching user chat logs:", error);
    res.status(500).json({ error: "Failed to retrieve chat logs" });
  }
});

router.post("/change-category", async (req: AuthRequest, res) => {
  try {
    const { sessionId, newCategoryId } = req.body;
    const userId = req.user?.userId;

    console.log(req.body);

    if (!sessionId || !newCategoryId || !userId) {
      res.status(400).json({
        error: "Missing sessionId, newCategoryId, or authorization",
      });
      return;
    }

    // Find and update the session
    const session = await Session.findOne({ _id: sessionId, userId });

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    // Update the conversation category
    session.conversation = newCategoryId;
    await session.save();

    // Get the updated session with populated conversation
    const updatedSession =
      await Session.findById(sessionId).populate("conversation");

    res.status(200).json({
      message: "Category updated successfully",
      session: updatedSession,
    });
  } catch (error) {
    console.error("Error changing category:", error);
    res.status(500).json({ error: "Failed to change category" });
  }
});

export default router;
