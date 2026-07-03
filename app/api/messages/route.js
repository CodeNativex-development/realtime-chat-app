import { auth } from "@/lib/auth";
import { db } from "@/db";
import { message, conversationMember } from "@/db/schema";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";

export async function GET(req) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get("conversationId");

        if (!conversationId) {
            return Response.json(
                { error: "Conversation id is required" },
                { status: 400 }
            );
        }

        const isMember = await db
            .select()
            .from(conversationMember)
            .where(
                and(
                    eq(conversationMember.conversationId, conversationId),
                    eq(conversationMember.userId, session.user.id)
                )
            )
            .limit(1);

        if (isMember.length === 0) {
            return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        const messages = await db
            .select()
            .from(message)
            .where(eq(message.conversationId, conversationId))
            .orderBy(message.createdAt);

        return Response.json({ messages });
    } catch (error) {
        console.log("GET_MESSAGES_ERROR:", error);
        return Response.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { conversationId, text } = await req.json();

        if (!conversationId) {
            return Response.json(
                { error: "Conversation id is required" },
                { status: 400 }
            );
        }

        if (!text?.trim()) {
            return Response.json({ error: "Message is required" }, { status: 400 });
        }

        const isMember = await db
            .select()
            .from(conversationMember)
            .where(
                and(
                    eq(conversationMember.conversationId, conversationId),
                    eq(conversationMember.userId, session.user.id)
                )
            )
            .limit(1);

        if (isMember.length === 0) {
            return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        const newMessage = await db
            .insert(message)
            .values({
                id: crypto.randomUUID(),
                conversationId,
                senderId: session.user.id,
                text: text.trim(),
            })
            .returning();

        return Response.json({ message: newMessage[0] });
    } catch (error) {
        console.log("SEND_MESSAGE_ERROR:", error);
        return Response.json({ error: "Failed to send message" }, { status: 500 });
    }
}