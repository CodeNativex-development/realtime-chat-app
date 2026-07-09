import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useEditMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ messageId, text }) => {
            const res = await fetch(`/api/messages/${messageId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            });

            if (!res.ok) throw new Error("Failed to edit message");

            return res.json();
        },

        onSuccess: (data) => {
            const msg = data.message;

            queryClient.invalidateQueries({
                queryKey: ["messages", msg.conversationId],
            });

            queryClient.invalidateQueries({
                queryKey: ["conversations"],
            });
        },
    });
}