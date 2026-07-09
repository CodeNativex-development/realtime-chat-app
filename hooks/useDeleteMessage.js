import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ messageId }) => {
            const res = await fetch(`/api/messages/${messageId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete message");

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