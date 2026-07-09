import { auth } from "@/lib/auth";
import { db } from "@/db";
import { message } from "@/db/schema";
import { headers } from "next/headers";
import { and, eq, ne } from "drizzle-orm";

export async function POST(request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { conversationId } = await request.json();

        await db
            .update(message)
            .set({
                seen: true,
                seenAt: new Date(),
            })
            .where(
                and(
                    eq(message.conversationId, conversationId),
                    ne(message.senderId, session.user.id),
                    eq(message.seen, false)
                )
            );

        return Response.json({ success: true });
    } catch (error) {
        console.log("SEEN_ERROR:", error);

        return Response.json(
            { error: "Failed to update seen status" },
            { status: 500 }
        );
    }
}