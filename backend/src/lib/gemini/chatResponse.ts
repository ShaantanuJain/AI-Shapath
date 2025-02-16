import { Schema, SchemaType } from "@google/generative-ai";
import getModel from "../../config/gemini";
import { IMessage } from "../../models/ChatLog";
import { ISession } from "../../models/Session";
import { SchemaTypes } from "mongoose";

export async function chatResponse(
  prevMessages: IMessage[],
  userMessage: string,
  session: {
    systemInstruction: string;
    redirectToOtherCategory: boolean;
    topics: string[];
  },
) {
  const responseSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      message: {
        type: SchemaType.STRING,
      },
    },
    required: ["message"],
  };

  if (session.redirectToOtherCategory) {
    responseSchema.properties!.redirectToOtherCategory = {
      type: SchemaType.STRING,
    };
  }

  const result = await getModel().generateContent({
    contents: [
      ...prevMessages.map((prevMessage) => ({
        role: prevMessage.role,
        parts: [
          {
            text: prevMessage.content,
          },
        ],
      })),
      {
        role: "user",
        parts: [
          {
            text: userMessage,
          },
        ],
      },
    ],
    systemInstruction:
      session.systemInstruction + session.redirectToOtherCategory
        ? "\n\nRedirect to other category options. The topic should be from one of the following topics:\n\nTopics: " +
          session.topics.join(", ")
        : "",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  return result;
}
