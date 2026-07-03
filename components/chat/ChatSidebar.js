"use client";

import { useMemo, useState } from "react";

import { useUsers } from "@/hooks/useUsers";
import { useConversation } from "@/hooks/useConversation";
import SearchInput from "./SearchInput";
import UserList from "./UserList";
import SidebarSkeleton from "./SidebarSkeleton";
import EmptyState from "./EmptyState";

export default function ChatSidebar({
    selectedChat,
    setSelectedChat,
}) {
    const [search, setSearch] = useState("");
    const {
        data: users = [],
        isPending,
        error,
    } = useUsers();
    const filteredUsers = useMemo(() => {
        return users.filter((user) =>
            user.name
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [users, search]);
    const conversationMutation = useConversation();
    const handleSelectUser = (user) => {
        conversationMutation.mutate(user.id, {
            onSuccess: (data) => {
                setSelectedChat({
                    ...user,
                    conversationId: data.conversationId,
                });
            },
        });
    };
    return (
        <aside className="flex h-full flex-col border-r bg-white">
            <div className="border-b p-5">
                <h2 className="mb-4 text-2xl font-bold text-[#0F172A]">
                    Chats
                </h2>
                <SearchInput
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="flex-1 overflow-y-auto p-3">
                {isPending ? (
                    <SidebarSkeleton />
                ) : error ? (
                    <EmptyState />
                ) : filteredUsers.length === 0 ? (
                    <EmptyState />
                ) : (
                    <UserList
                        users={filteredUsers}
                        selectedChat={selectedChat}
                        setSelectedChat={handleSelectUser}
                    />
                )}
            </div>
        </aside>
    );
}