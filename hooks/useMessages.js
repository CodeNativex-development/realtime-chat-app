import { useQuery } from "@tanstack/react-query";

export function useMessages(conversationId) {
    return useQuery({
        queryKey: ["messages", conversationId],
        enabled: !!conversationId,
        queryFn: async () => {
            const res = await fetch(
                `/api/messages?conversationId=${conversationId}`
            );
            if (!res.ok) {
                throw new Error("Failed to fetch messages");
            }
            const data = await res.json();
            return data.messages;
        },
    });
}