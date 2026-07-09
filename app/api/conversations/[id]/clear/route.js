import { auth } from "@/lib/auth";
import { db } from "@/db";
import { message, conversationMember } from "@/db/schema";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";

export async function DELETE(req, { params }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const member = await db
            .select()
            .from(conversationMember)
            .where(
                and(
                    eq(conversationMember.conversationId, id),
                    eq(conversationMember.userId, session.user.id)
                )
            );

        if (!member.length) {
            return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        await db
            .delete(message)
            .where(eq(message.conversationId, id));

        return Response.json({ success: true });
    } catch (error) {
        console.log(error);

        return Response.json(
            { error: "Failed to clear chat" },
            { status: 500 }
        );
    }
}