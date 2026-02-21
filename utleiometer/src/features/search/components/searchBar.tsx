"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/ui/primitives/input";

type Props = {
    actionPath?: string;
    initialQuery?: string;
};

export function SearchBar({ actionPath = "/properties", initialQuery = ""}: Props) {
    const router = useRouter();
    const [search, setSearch] = useState(initialQuery);

    return (
        <form 
            className="mt-10 flex justify-center w-full"
            onSubmit={(e) => {
                e.preventDefault();
                const q = search.trim()
                router.push(q ? `${actionPath}?q=${encodeURIComponent(q)}` : actionPath);
            }}
        >
            <Input
                id="search-bar"
                placeholder="Søk etter bolig"
                className="h-16 w-full max-w-2xl text-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </form>
    )
}