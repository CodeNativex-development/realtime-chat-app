import { auth } from "@/lib/auth";
import { db } from "@/db";
import { message } from "@/db/schema";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";

export async function PATCH(req, { params }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { text } = await req.json();
        const { id } = await params;

        if (!text?.trim()) {
            return Response.json({ error: "Message is required" }, { status: 400 });
        }

        const updated = await db
            .update(message)
            .set({
                text: text.trim(),
                editedAt: new Date(),
            })
            .where(and(eq(message.id, id), eq(message.senderId, session.user.id)))
            .returning();

        if (updated.length === 0) {
            return Response.json({ error: "Message not found" }, { status: 404 });
        }

        return Response.json({ message: updated[0] });
    } catch (error) {
        console.log("EDIT_MESSAGE_ERROR:", error);
        return Response.json({ error: "Failed to edit message" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const deleted = await db
            .delete(message)
            .where(and(eq(message.id, id), eq(message.senderId, session.user.id)))
            .returning();

        if (deleted.length === 0) {
            return Response.json({ error: "Message not found" }, { status: 404 });
        }

        return Response.json({ message: deleted[0] });
    } catch (error) {
        console.log("DELETE_MESSAGE_ERROR:", error);
        return Response.json({ error: "Failed to delete message" }, { status: 500 });
    }
}