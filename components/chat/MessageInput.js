"use client";

import { Image, Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";
import { useEditMessage } from "@/hooks/useEditMessage";
import EmojiPicker from "emoji-picker-react";

export default function MessageInput({ selectedChat, editingMessage,
    setEditingMessage, }) {
    const [showEmoji, setShowEmoji] = useState(false);
    const emojiRef = useRef(null);
    const [text, setText] = useState("");
    const typingTimeoutRef = useRef(null);
    const sendMutation = useSendMessage();
    const editMutation = useEditMessage();
    useEffect(() => {
        if (editingMessage) {
            setText(editingMessage.text);
        } else {
            setText("");
        }
    }, [editingMessage]);
    useEffect(() => {
        setText("");
    }, [selectedChat?.conversationId]);
    const handleSend = () => {
        if (!text.trim()) return;
        if (!selectedChat?.conversationId) return;

        if (editingMessage) {
            editMutation.mutate(
                {
                    messageId: editingMessage.id,
                    text,
                },
                {
                    onSuccess: () => {
                        setText("");
                        setEditingMessage(null);
                    },
                }
            );

            return;
        }

        sendMutation.mutate({
            conversationId: selectedChat.conversationId,
            text,
        });

        setText("");
    };
    useEffect(() => {
        const handleClick = (e) => {
            if (
                emojiRef.current &&
                !emojiRef.current.contains(e.target)
            ) {
                setShowEmoji(false);
            }
        };

        document.addEventListener("mousedown", handleClick);

        return () =>
            document.removeEventListener("mousedown", handleClick);
    }, []);
    const fileInputRef = useRef(null);
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedChat?.conversationId) return;

        const filePath = `${Date.now()}-${file.name}`;

        const { error } = await supabase.storage
            .from("documents")
            .upload(filePath, file);

        if (error) {
            alert(error.message);
            return;
        }

        const { data } = supabase.storage
            .from("documents")
            .getPublicUrl(filePath);

        const messageType = file.type.startsWith("image")
            ? "image"
            : file.type.startsWith("video")
                ? "video"
                : file.type.startsWith("audio")
                    ? "audio"
                    : "file";

        sendMutation.mutate({
            conversationId: selectedChat.conversationId,
            text: file.name,
            type: messageType,
            fileUrl: data.publicUrl,
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
        });

        e.target.value = "";
    };
    return (
        <div className="border-t border-[#E2E8F0] bg-white p-4">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEmoji((prev) => !prev)}
                >
                    <Smile className="size-5 text-[#64748B]" />
                </Button>
                <input
                    type="file"
                    accept="image/*,video/*,audio/*"
                    hidden
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                />

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current.click()}
                >
                    <Image className="size-5 text-[#64748B]" />
                </Button>
                {editingMessage && (
                    <div className="mb-3 flex items-center justify-between rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-2">
                        <div>
                            <p className="text-xs font-medium text-[#2563EB]">Editing message</p>
                            <p className="max-w-[260px] truncate text-sm text-[#64748B]">
                                {editingMessage.text}
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setEditingMessage(null);
                                setText("");
                            }}
                            className="rounded-full p-1 hover:bg-white"
                        >
                            <X className="h-4 w-4 text-[#64748B]" />
                        </button>
                    </div>
                )}
                {showEmoji && (
                    <div className="realitive bottom-16 left-0 z-50" ref={emojiRef}>
                        <EmojiPicker
                            onEmojiClick={(emojiData) => {
                                setText((prev) => prev + emojiData.emoji);
                                setShowEmoji(false);
                            }}
                        />
                    </div>
                )}
                <Input
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        if (!selectedChat?.conversationId) return;
                        supabase.channel(`typing-${selectedChat.conversationId}`).send({
                            type: "broadcast",
                            event: "typing",
                            payload: {
                                conversationId: selectedChat.conversationId,
                            },
                        });
                        clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(() => {
                            supabase.channel(`typing-${selectedChat.conversationId}`).send({
                                type: "broadcast",
                                event: "stop-typing",
                                payload: {
                                    conversationId: selectedChat.conversationId,
                                },
                            });
                        }, 1000);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSend();
                    }}
                    placeholder="Type a message..."
                    className="h-11 flex-1 rounded-xl border-[#E2E8F0] bg-[#F8FAFC]"
                />

                <Button
                    onClick={handleSend}
                    disabled={sendMutation.isPending}
                    size="icon"
                    className="h-11 w-11 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8]"
                >
                    <Send className="size-5" />
                </Button>
            </div>
        </div>
    );
}