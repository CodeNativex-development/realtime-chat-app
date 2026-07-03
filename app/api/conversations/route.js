import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
    conversation,
    conversationMember,
} from "@/db/schema";
import { headers } from "next/headers";
import { and, eq, inArray } from "drizzle-orm";

export async function POST(req) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId } = await req.json();

        if (!userId) {
            return Response.json({ error: "User id is required" }, { status: 400 });
        }

        const currentUserId = session.user.id;

        const currentUserConversations = await db
            .select({ conversationId: conversationMember.conversationId })
            .from(conversationMember)
            .where(eq(conversationMember.userId, currentUserId));

        const ids = currentUserConversations.map((item) => item.conversationId);

        if (ids.length > 0) {
            const existing = await db
                .select({ conversationId: conversationMember.conversationId })
                .from(conversationMember)
                .where(
                    and(
                        eq(conversationMember.userId, userId),
                        inArray(conversationMember.conversationId, ids)
                    )
                )
                .limit(1);

            if (existing.length > 0) {
                return Response.json({
                    conversationId: existing[0].conversationId,
                });
            }
        }

        const newConversationId = crypto.randomUUID();

        await db.insert(conversation).values({
            id: newConversationId,
        });

        await db.insert(conversationMember).values([
            {
                id: crypto.randomUUID(),
                conversationId: newConversationId,
                userId: currentUserId,
            },
            {
                id: crypto.randomUUID(),
                conversationId: newConversationId,
                userId,
            },
        ]);

        return Response.json({
            conversationId: newConversationId,
        });
    } catch (error) {
        console.log("CONVERSATION_API_ERROR:", error);

        return Response.json(
            { error: "Failed to create conversation" },
            { status: 500 }
        );
    }
}