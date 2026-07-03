"use client"
import UserCard from "./UserCard";

export default function UserList({
    users,
    selectedChat,
    setSelectedChat,
}) {
    return (
        <div className="space-y-2">
            {users.map((user) => (
                <UserCard
                    key={user.id}
                    user={user}
                    selected={selectedChat?.id === user.id}
                    onClick={setSelectedChat}
                />
            ))}
        </div>
    );
}