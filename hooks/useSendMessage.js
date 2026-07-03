import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSendMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ conversationId, text }) => {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    conversationId,
                    text,
                }),
            });
            if (!res.ok) {
                throw new Error("Failed to send message");
            }
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["messages", variables.conversationId],
            });
        },
    });
}