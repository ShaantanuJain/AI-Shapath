import express from "express";
import { authenticateToken } from "../middleware/auth";
import { Session } from "../models/Session";
import { ConversationCategory } from "../models/ConversationCategories";
import type { Request, Response } from "express";
import { chatResponse } from "../lib/gemini/chatResponse";
import { ChatLog } from "../models/ChatLog";

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

// GET all sessions for logged-in user
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const sessions = await Session.find({ userId });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// GET one session by ID (must belong to the user)
router.get(
  "/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const session = await Session.findOne({ _id: req.params.id, userId });
      if (!session) {
        res.status(404).json({ error: "Session not found" });
        return;
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  },
);

// CREATE a new session
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const { conversationCategoryId, summary, nMinusTenSummary } = req.body;

    // Ensure the referenced conversation category exists
    const conversationCategory = await ConversationCategory.findById(
      conversationCategoryId,
    );
    if (!conversationCategory) {
      res.status(400).json({ error: "Invalid conversationCategoryId" });
      return;
    }

    // Create the new session
    const newSession = new Session({
      userId,
      conversation: conversationCategory._id,
      summary: summary || "",
      nMinusTenSummary: nMinusTenSummary || "",
    });
    await newSession.save();

    // Get initial AI response using the category's system prompt
    const systemInstruction =
      conversationCategory.prompt || "You are a helpful assistant.";

    try {
      const llmResponse = await chatResponse([], "", {
        systemInstruction,
        redirectToOtherCategory: false,
        topics: [], // Empty for initial message
      });

      // Parse the response
      const responseText =
        llmResponse.response.candidates &&
        llmResponse.response.candidates[0].content.parts[0].text;
      if (!responseText) {
        throw new Error("AI response is empty");
      }
      const aiResult = JSON.parse(responseText);

      // Create a new chat log with the AI's initial message
      const chatLog = new ChatLog({
        session: newSession._id,
        userId,
        messages: [
          {
            role: "model",
            content: aiResult.message,
          },
        ],
      });
      await chatLog.save();

      // Return both the session and initial chat log
      res.status(201).json({
        session: newSession,
        chatLog,
      });
    } catch (error) {
      // If AI response fails, still create session but without initial message
      res.status(201).json({
        session: newSession,
        chatLog: null,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to create session" });
  }
});

// UPDATE a session
router.put(
  "/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { conversationCategoryId, summary, nMinusTenSummary } = req.body;

      // If conversationCategoryId is provided, ensure the category exists
      let updateData: any = { summary, nMinusTenSummary };
      if (conversationCategoryId) {
        const conversationCategory = await ConversationCategory.findById(
          conversationCategoryId,
        );
        if (!conversationCategory) {
          res.status(400).json({ error: "Invalid conversationCategoryId" });
          return;
        }
        updateData.conversation = conversationCategory._id;
      }

      const updatedSession = await Session.findOneAndUpdate(
        { _id: req.params.id, userId },
        updateData,
        { new: true },
      );
      if (!updatedSession) {
        res.status(404).json({ error: "Session not found or unauthorized" });
        return;
      }
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ error: "Failed to update session" });
    }
  },
);

// DELETE a session
router.delete(
  "/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const deletedSession = await Session.findOneAndDelete({
        _id: req.params.id,
        userId,
      });
      if (!deletedSession) {
        res.status(404).json({ error: "Session not found or unauthorized" });
        return;
      }
      res.json({ message: "Session deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete session" });
    }
  },
);

export default router;
