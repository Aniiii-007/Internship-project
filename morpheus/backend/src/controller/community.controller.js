import { db } from "../db/connect.js";
import { communityMessages, users } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";

/**
 * Fetch historical community chat messages, ordered chronologically.
 * We fetch the latest messages (descending) and then invert the array so
 * the frontend maps from oldest to newest in the chat box.
 */
export async function getCommunityHistory(req, res, next) {
    try {
        const limit = parseInt(req.query.limit) || 50;

        // We only fetch non-flagged messages
        const pastMessages = await db
            .select({
                id: communityMessages.id,
                content: communityMessages.content,
                createdAt: communityMessages.createdAt,
                sender: {
                    id: users.id,
                    name: users.name,
                }
            })
            .from(communityMessages)
            .leftJoin(users, eq(communityMessages.senderId, users.id))
            .where(eq(communityMessages.isFlagged, false))
            .orderBy(desc(communityMessages.createdAt))
            .limit(limit);

        // Return in chronological order (oldest first at the top of the chat view)
        res.status(200).json({
            success: true,
            data: pastMessages.reverse(),
        });
    } catch (error) {
        next(error);
    }
}