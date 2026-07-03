"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function UserCard({
    user,
    selected,
    onClick,
}) {
    return (
        <button
            onClick={() => onClick(user)}
            className={cn(
                "flex w-full items-center gap-3 rounded-2xl border border-transparent p-3 text-left transition-all duration-200",
                "hover:border-[#DBEAFE] hover:bg-[#EFF6FF]",
                selected && "border-[#2563EB] bg-[#EFF6FF]"
            )}
        >
            <div className="relative">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback className="bg-[#2563EB] text-white">
                        {user.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
            </div>

            <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-[#0F172A]">
                    {user.name}
                </h3>
                <p className="truncate text-sm text-[#64748B]">
                    {user.email}
                </p>
            </div>
        </button>
    );
}