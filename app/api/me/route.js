import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return Response.json({ user: null }, { status: 401 });
        }

        return Response.json({
            user: session.user,
        });
    } catch (error) {
        console.log("ME_API_ERROR:", error);

        return Response.json(
            { error: "Failed to fetch current user" },
            { status: 500 }
        );
    }
}