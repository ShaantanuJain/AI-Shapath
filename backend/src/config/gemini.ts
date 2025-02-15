import { GoogleGenerativeAI } from "@google/generative-ai";

const getModel = () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
  });
  return model;
};

export default getModel;
