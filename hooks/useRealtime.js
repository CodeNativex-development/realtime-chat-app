"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useRealtime(currentUser) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!currentUser?.id) return;

        const channel = supabase
            .channel("messages-realtime")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "message",
                },
                (payload) => {
                    const row = payload.new || payload.old;

                    if (!row?.conversation_id) return;

                    const conversationId = row.conversation_id;

                    const formattedMessage = payload.new
                        ? {
                            id: payload.new.id,
                            conversationId: payload.new.conversation_id,
                            senderId: payload.new.sender_id,
                            text: payload.new.text,
                            seen: payload.new.seen,
                            seenAt: payload.new.seen_at,
                            createdAt: payload.new.created_at,
                        }
                        : null;

                    if (payload.eventType === "INSERT") {
                        queryClient.setQueryData(["messages", conversationId], (old = []) => {
                            const exists = old.some((msg) => msg.id === formattedMessage.id);
                            if (exists) return old;
                            return [...old, formattedMessage];
                        });
                    }
                    if (payload.eventType === "UPDATE") {
                        queryClient.setQueryData(["messages", conversationId], (old = []) =>
                            old.map((msg) =>
                                msg.id === formattedMessage.id ? formattedMessage : msg
                            )
                        );
                    }

                    if (payload.eventType === "DELETE") {
                        queryClient.setQueryData(["messages", conversationId], (old = []) =>
                            old.filter((msg) => msg.id !== payload.old.id)
                        );
                    }

                    queryClient.invalidateQueries({
                        queryKey: ["conversations"],
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser?.id, queryClient]);
}