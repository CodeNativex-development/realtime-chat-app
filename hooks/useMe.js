import { useQuery } from "@tanstack/react-query";

export function useMe() {
    return useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const res = await fetch("/api/me");

            if (!res.ok) {
                throw new Error("Failed to fetch user");
            }

            const data = await res.json();
            return data.user;
        },
    });
}