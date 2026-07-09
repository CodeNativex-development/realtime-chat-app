import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useClearChat() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (conversationId) => {
            const res = await fetch(
                `/api/conversations/${conversationId}/clear`,
                {
                    method: "DELETE",
                }
            );

            if (!res.ok) throw new Error("Failed");

            return res.json();
        },

        onSuccess: (_, conversationId) => {
            queryClient.invalidateQueries({
                queryKey: ["messages", conversationId],
            });

            queryClient.invalidateQueries({
                queryKey: ["conversations"],
            });
        },
    });
}