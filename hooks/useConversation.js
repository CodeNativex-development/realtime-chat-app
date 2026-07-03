import { useMutation } from "@tanstack/react-query";

export function useConversation() {
    return useMutation({
        mutationFn: async (userId) => {
            const res = await fetch("/api/conversations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            });
            if (!res.ok) {
                throw new Error("Failed to open conversation");
            }
            return res.json();
        },
    });
}