import { db } from "../db/connect.js";
import {
    aiChatSessions,
    aiChatMessages,
} from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { extractTextFromImage } from "../services/ocr.js";
import { uploadToImageKit } from "../services/imagekit.service.js";
import { generateChatbotResponse } from "../services/ai.service.js";

/**
 * Creates a new AI chat session for the authenticated user.
 */
export async function createChatSession(req, res, next) {
    try {
        const userId = req.user.id;
        const { title } = req.body;

        const [newSession] = await db
            .insert(aiChatSessions)
            .values({
                userId,
                title: title || "New Conversation",
            })
            .returning();

        res.status(201).json({
            success: true,
            data: newSession,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get all AI chat sessions for the authenticated user
 */
export async function getChatSessions(req, res, next) {
    try {
        const userId = req.user.id;

        const sessions = await db
            .select()
            .from(aiChatSessions)
            .where(eq(aiChatSessions.userId, userId))
            .orderBy(desc(aiChatSessions.updatedAt));

        res.status(200).json({
            success: true,
            data: sessions,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get history (messages) for a specific session
 */
export async function getChatSessionHistory(req, res, next) {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        // Verify session belongs to user
        const [session] = await db
            .select()
            .from(aiChatSessions)
            .where(eq(aiChatSessions.id, sessionId));

        if (!session || session.userId !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized or session not found" });
        }

        const messages = await db
            .select()
            .from(aiChatMessages)
            .where(eq(aiChatMessages.sessionId, sessionId))
            .orderBy(aiChatMessages.createdAt);

        res.status(200).json({
            success: true,
            data: messages,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Ask a question in a specific session. Handles optional image upload.
 */
export async function askChatbot(req, res, next) {
    try {
        const { sessionId } = req.params;
        const { question } = req.body;
        const userId = req.user.id;

        if (!question && !req.file) {
            return res.status(400).json({ success: false, message: "Provide a question or an image" });
        }

        // Verify session belongs to user
        const [session] = await db
            .select()
            .from(aiChatSessions)
            .where(eq(aiChatSessions.id, sessionId));

        if (!session || session.userId !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized or session not found" });
        }

        let imageUrl = null;
        let ocrText = null;

        // 1. Process Image (if provided)
        if (req.file) {
            // Upload to ImageKit
            const uploadResult = await uploadToImageKit(req.file.buffer, req.file.originalname, 'chatbot-uploads');
            imageUrl = uploadResult.url;

            // Run OCR using Tesseract Worker
            ocrText = await extractTextFromImage(req.file.buffer);
        }

        // 2. Fetch Chat History
        const history = await db
            .select()
            .from(aiChatMessages)
            .where(eq(aiChatMessages.sessionId, sessionId))
            .orderBy(aiChatMessages.createdAt);

        // 3. Save User Message
        const [userMessage] = await db
            .insert(aiChatMessages)
            .values({
                sessionId,
                role: "user",
                content: question || (ocrText ? "Uploaded an image." : ""),
                imageUrl,
            })
            .returning();

        // 4. Generate AI Response using Groq
        const currentQuestion = question || "";
        const aiResponseText = await generateChatbotResponse(history, currentQuestion, ocrText);

        // 5. Save System Message
        const [systemMessage] = await db
            .insert(aiChatMessages)
            .values({
                sessionId,
                role: "model",
                content: aiResponseText,
            })
            .returning();

        // Update Session Timestamp
        await db
            .update(aiChatSessions)
            .set({ updatedAt: new Date() })
            .where(eq(aiChatSessions.id, sessionId));

        res.status(200).json({
            success: true,
            data: {
                userMessage,
                systemMessage,
            },
        });
    } catch (error) {
        next(error);
    }
}