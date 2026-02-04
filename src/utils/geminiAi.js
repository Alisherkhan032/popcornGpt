const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable
export const geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;

export const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;