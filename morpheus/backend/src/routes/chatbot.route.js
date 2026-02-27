import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
    createChatSession,
    getChatSessions,
    getChatSessionHistory,
    askChatbot,
} from "../controller/chatbot.controller.js";
import multer from "multer";

const chatbotRouter = Router();

// Memory storage for multer (we upload buffer directly to ImageKit)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Apply auth middleware to all chatbot routes
chatbotRouter.use(authenticate);

// Start a new AI chat session
chatbotRouter.post("/session", createChatSession);

// Get all AI chat sessions for the current user
chatbotRouter.get("/", getChatSessions);

// Get chat history for a specific session
chatbotRouter.get("/:sessionId", getChatSessionHistory);

// Ask a question in a specific session (with optional image)
chatbotRouter.post("/:sessionId/ask", upload.single("image"), askChatbot);

export default chatbotRouter;