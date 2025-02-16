import express from "express";
import { ChatLog } from "../models/ChatLog";
import { Session } from "../models/Session";
import { chatResponse } from "../lib/gemini/chatResponse";

const router = express.Router();

/*
  POST /chat/message
  Sends a new message. It expects:
    { sessionId, userMessage }
  It retrieves the existing chat log, saves the user’s message,
  calls the AI (using previous messages and session details),
  saves the AI’s response, and if a redirect is suggested by the AI,
  updates the session accordingly.
 */
router.post("/message", async (req, res) => {
  try {
    const { sessionId, userMessage } = req.body;
    if (!sessionId || !userMessage) {
      res.status(400).json({ error: "Missing sessionId or userMessage" });
      return;
    }

    // Retrieve the ChatLog and Session documents
    const chatLog = await ChatLog.findOne({ session: sessionId });
    if (!chatLog) {
      res.status(404).json({ error: "Chat log not found" });
      return;
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    // Append the user message
    chatLog.messages.push({ role: "user", content: userMessage });
    await chatLog.save();

    // Prepare payload for the AI response.
    // We assume the session (or its conversation) holds a systemInstruction.
    // For example, if your ConversationCategory model has systemInstruction, you can use that.
    // Otherwise, supply a default or pass it from the frontend.
    const systemInstruction =
      // @ts-ignore
      (session.conversation && session.conversation.systemInstruction) ||
      "You are a helpful assistant.";
    const redirectPlaceholder = ""; // you can set this if needed or pass an empty string
    let aiResult: {
      message: string;
      redirectToOtherCategory?: string;
    };
    try {
      const llmResponse = await chatResponse(chatLog.messages, userMessage, {
        systemInstruction,
        redirectToOtherCategory:
          session.conversation.redirectableToOtherCategory,
      });
      try {
        JSON.parse(
          (llmResponse.response.candidates &&
            llmResponse.response.candidates[0].content.parts[0].text) ||
            JSON.stringify({}),
        );
      } catch (error) {
        console.error("Error parsing JSON:", error);
        throw new Error("Failed to parse JSON response");
      }
      aiResult = JSON.parse(
        (llmResponse.response.candidates &&
          llmResponse.response.candidates[0].content.parts[0].text) ||
          JSON.stringify({}),
      );
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ error: "Failed to process chat message" });
      return;
    }

    // Expected aiResult to have a structure { message, redirectToOtherCategory? }
    const aiMessage = aiResult.message || "";
    chatLog.messages.push({ role: "bot", content: aiMessage });
    await chatLog.save();

    // If the AI indicates a redirection to another category, update the session.
    if (aiResult.redirectToOtherCategory) {
      // Here you might verify that the new category exists.
      // session.conversation = aiResult.redirectToOtherCategory;
      console.log("Redirecting to another category");
      await session.save();
    }

    res.status(200).json({ chatLog, session });
  } catch (error) {
    console.error("Error processing message:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

/*
  GET /chat/session/:sessionId
  Retrieves the chat log messages for a specific session.
*/
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const chatLog = await ChatLog.findOne({ session: sessionId }).populate(
      "session",
    );
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
  Retrieves all chat logs for a user (each associated with a session).
*/
router.get("/user/:userId", async (req, res) => {
  try {
    const chatLogs = await ChatLog.find({ userId: req.params.userId }).populate(
      "session",
    );
    res.json(chatLogs);
  } catch (error) {
    console.error("Error fetching user chat logs:", error);
    res.status(500).json({ error: "Failed to retrieve chat logs" });
  }
});

export default router;
