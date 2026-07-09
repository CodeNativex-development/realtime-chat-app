"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useMessages } from "@/hooks/useMessages";
import { supabase } from "@/lib/supabase";
import { useEffect, useRef } from "react";
import { useSeenMessages } from "@/hooks/useSeenMessages";
import { MoreVertical } from "lucide-react";
import { useEditMessage } from "@/hooks/useEditMessage";
import { useDeleteMessage } from "@/hooks/useDeleteMessage";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

export default function MessageList({
    selectedChat,
    currentUser,
    setIsTyping,
    onlineUsers,
    setEditingMessage
}) {
    const bottomRef = useRef(null);
    const conversationId = selectedChat?.conversationId;
    const receiverOnline = onlineUsers?.includes(selectedChat?.id);

    const seenMutation = useSeenMessages();
    const editMutation = useEditMessage();
    const deleteMutation = useDeleteMessage();

    const { data: messages = [], isPending } = useMessages(conversationId);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!conversationId) return;
        seenMutation.mutate({ conversationId });
    }, [conversationId]);

    useEffect(() => {
        if (!conversationId) return;

        const channel = supabase
            .channel(`typing-${conversationId}`)
            .on("broadcast", { event: "typing" }, () => setIsTyping(true))
            .on("broadcast", { event: "stop-typing" }, () => setIsTyping(false))
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            setIsTyping(false);
        };
    }, [conversationId, setIsTyping]);

    const handleEdit = (msg) => {
        if (msg.deletedAt) return;
        setEditingMessage(msg);
    };


    if (!selectedChat) {
        return (
            <div className="flex flex-1 items-center justify-center text-[#64748B]">
                Select a user to start chat
            </div>
        );
    }

    if (isPending) {
        return (
            <div className="flex flex-1 items-center justify-center text-[#64748B]">
                Loading messages...
            </div>
        );
    }

    return (
        <ScrollArea className="min-h-0 flex-1 bg-[#F8FAFC] p-4">
            <div className="space-y-3">
                {messages.map((msg) => {
                    const isMe = msg.senderId === currentUser?.id;
                    const isDeleted = !!msg.deletedAt;

                    return (
                        <div
                            key={msg.id}
                            className={`group flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`relative max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe
                                    ? "bg-[#3e72e0] text-white"
                                    : "border border-[#E2E8F0] bg-white text-[#0F172A]"
                                    } ${isDeleted ? "opacity-80 italic" : ""}`}
                            >
                                {isMe && !isDeleted && (
                                    <div className="absolute -left-9 top-1 opacity-0 transition group-hover:opacity-100">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="rounded-full p-1 text-[#64748B] hover:bg-[#E2E8F0]">
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(msg)}>
                                                    Edit
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => deleteMutation.mutate({ messageId: msg.id })}
                                                    className="text-red-600"
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}

                                {isDeleted ? "This message was deleted" :
                                    msg.type === "image" ? (
                                        <Image
                                            src={msg.fileUrl}
                                            alt={msg.fileName}
                                            width={300}
                                            height={300}
                                            className="rounded-xl object-cover"
                                        />
                                    ) : msg.type === "video" ? (
                                        <video src={msg.fileUrl} controls className="max-h-64 rounded-xl" />
                                    ) : msg.type === "audio" ? (
                                        <audio src={msg.fileUrl} controls />
                                    ) : (
                                        <p>{msg.text}</p>
                                    )
                                }

                                <div className="mt-1 flex items-center justify-end gap-1">
                                    {msg.editedAt && !isDeleted && (
                                        <span className="text-[11px] opacity-70">edited</span>
                                    )}

                                    <span
                                        className={`text-[11px] ${isMe ? "text-white/70" : "text-[#94A3B8]"
                                            }`}
                                    >
                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>

                                    {isMe && !isDeleted && (
                                        <span
                                            className={`text-[12px] font-semibold ${msg.seen
                                                ? "text-black"
                                                : receiverOnline
                                                    ? "text-white/80"
                                                    : "text-white/60"
                                                }`}
                                        >
                                            {msg.seen ? "✓✓" : receiverOnline ? "✓✓" : "✓"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div ref={bottomRef} />
            </div>
        </ScrollArea>
    );
}