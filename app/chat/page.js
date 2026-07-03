"use client";

import { useState } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import { useMe } from "@/hooks/useMe";

export default function ChatPage() {
    const [selectedChat, setSelectedChat] = useState(null);
    const { data: currentUser } = useMe();
    console.log(selectedChat);
    return (
        <div className="h-screen bg-[#F8FAFC]">
            <div className="flex h-full">
                <div
                    className={`${selectedChat ? "hidden md:flex" : "flex"
                        } h-full w-full flex-col md:w-[360px]`}
                >
                    <ChatSidebar
                        selectedChat={selectedChat}
                        setSelectedChat={setSelectedChat}
                    />
                </div>

                <main
                    className={`${selectedChat ? "flex" : "hidden md:flex"
                        } h-full flex-1 flex-col`}
                >
                    {selectedChat ? (
                        <>
                            <ChatHeader
                                chat={selectedChat}
                                onBack={() => setSelectedChat(null)}
                            />
                            <MessageList
                                selectedChat={selectedChat}
                                currentUser={currentUser}
                            />
                            <MessageInput selectedChat={selectedChat} />
                        </>
                    ) : (
                        <div className="hidden flex-1 items-center justify-center text-[#64748B] md:flex">
                            Select a chat to start messaging
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}