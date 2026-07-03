import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SearchInput({ value, onChange }) {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <Input
                value={value}
                onChange={onChange}
                placeholder="Search users..."
                className="h-11 rounded-xl border-[#E2E8F0] bg-[#F8FAFC] pl-9 text-sm"
            />
        </div>
    );
}