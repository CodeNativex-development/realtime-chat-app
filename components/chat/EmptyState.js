import { Users } from "lucide-react";

export default function EmptyState() {
    return (
        <div className="flex h-[300px] flex-col items-center justify-center">
            <Users className="mb-3 h-10 w-10 text-gray-400" />

            <h3 className="font-semibold">
                No users found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
                Try another search.
            </p>
        </div>
    );
}