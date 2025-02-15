import express from "express";
import type { Request, Response } from "express";
import { chatResponse } from "../lib/gemini/chatResponse";

const router = express.Router();

/*
  Expected JSON body:
  {
    "prevMessages": [
      { "role": "assistant", "content": "Hello, how can I help?" },
      { "role": "user", "content": "What's the weather?" }
    ],
    "userMessage": "Tell me a joke, please.",
    "session": {
      "systemInstruction": "You are a helpful assistant.",
      // ... any additional session properties
    }
  }
*/
router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { prevMessages, userMessage, session } = req.body;
    if (!prevMessages || !userMessage || !session) {
      res.status(400).json({
        error:
          "Missing required fields. Please provide prevMessages, userMessage, and session.",
      });
      return;
    }

    // Call the updated Gemini chat response function.
    const response = await chatResponse(prevMessages, userMessage, session);
    res.json({
      response: JSON.parse(
        (response.response.candidates &&
          response.response.candidates[0].content.parts[0].text) ||
          JSON.stringify({}),
      ),
    });
  } catch (error) {
    console.error("Error generating Gemini chat response:", error);
    res.status(500).json({ error: "Failed to generate Gemini chat response" });
  }
});

export default router;
