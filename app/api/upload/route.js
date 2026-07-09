import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function POST(req) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return Response.json(
                { error: "No file selected" },
                { status: 400 }
            );
        }

        const fileName = `${Date.now()}-${file.name}`;

        const { error } = await supabase.storage
            .from("documents")
            .upload(fileName, file);

        if (error) {
            return Response.json(
                { error: error.message },
                { status: 500 }
            );
        }

        const { data } = supabase.storage
            .from("documents")
            .getPublicUrl(fileName);

        return Response.json({
            url: data.publicUrl,
            name: file.name,
            size: file.size,
            type: file.type,
        });
    } catch (error) {
        console.log("UPLOAD_ERROR:", error);

        return Response.json(
            { error: "Upload failed" },
            { status: 500 }
        );
    }
}